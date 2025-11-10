import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "path";

@Injectable()
export class TemplateGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(TemplateGrpcClient.name);
  private client: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>(
      "TEMPLATE_SERVICE_HOST",
      "template-service"
    );
    const port = this.configService.get<number>(
      "TEMPLATE_SERVICE_GRPC_PORT",
      50052
    );

    const packageDefinition = protoLoader.loadSync(
      join(__dirname, "../../proto/template.proto"),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const templateProto = grpc.loadPackageDefinition(packageDefinition) as any;

    this.client = new templateProto.template.TemplateService(
      `${host}:${port}`,
      grpc.credentials.createInsecure()
    );

    this.logger.log(`✅ Template gRPC client initialized (${host}:${port})`);
  }

  async getTemplateById(templateId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetTemplateById(
        { id: templateId },
        (error: any, response: any) => {
          if (error) {
            this.logger.error(`gRPC error: ${error.message}`);
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }
}
