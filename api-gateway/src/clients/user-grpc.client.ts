import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "path";

@Injectable()
export class UserGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(UserGrpcClient.name);
  private client: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>(
      "USER_SERVICE_HOST",
      "user-service"
    );
    const port = this.configService.get<number>(
      "USER_SERVICE_GRPC_PORT",
      50051
    );

    const packageDefinition = protoLoader.loadSync(
      join(__dirname, "../../proto/user.proto"),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const userProto = grpc.loadPackageDefinition(packageDefinition) as any;

    this.client = new userProto.user.UserService(
      `${host}:${port}`,
      grpc.credentials.createInsecure()
    );

    this.logger.log(`✅ User gRPC client initialized (${host}:${port})`);
  }

  async getUserById(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetUserById({ id: userId }, (error: any, response: any) => {
        if (error) {
          this.logger.error(`gRPC error: ${error.message}`);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
