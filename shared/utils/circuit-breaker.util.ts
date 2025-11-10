import { Logger } from "@nestjs/common";

export class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(
    private readonly name: string,
    private readonly errorThreshold: number = 5,
    private readonly timeout: number = 3000,
    private readonly resetTimeout: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        this.logger.warn(`Circuit breaker [${this.name}] is OPEN`);
        throw new Error(`Circuit breaker [${this.name}] is open`);
      }
      this.state = "HALF_OPEN";
      this.logger.log(
        `Circuit breaker [${this.name}] entering HALF_OPEN state`
      );
    }

    try {
      const result = await Promise.race([fn(), this.timeoutPromise()]);

      this.onSuccess();
      return result as T;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Circuit breaker [${this.name}] timeout`));
      }, this.timeout);
    });
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
      this.logger.log(`Circuit breaker [${this.name}] is now CLOSED`);
    }
  }

  private onFailure() {
    this.failures++;
    this.logger.warn(
      `Circuit breaker [${this.name}] failure count: ${this.failures}/${this.errorThreshold}`
    );

    if (this.failures >= this.errorThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.logger.error(
        `Circuit breaker [${this.name}] is now OPEN. Will retry after ${this.resetTimeout}ms`
      );
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt,
    };
  }

  reset() {
    this.failures = 0;
    this.state = "CLOSED";
    this.nextAttempt = Date.now();
    this.logger.log(`Circuit breaker [${this.name}] has been reset`);
  }
}
