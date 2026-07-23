import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { Sendgo, SendgoConfig } from '@sendgo/node';
import { SENDGO_OPTIONS } from './sendgo.constants';
import { SendgoService } from './sendgo.service';

/** `forRootAsync()` 설정 옵션 */
export interface SendgoModuleAsyncOptions {
  /** 팩토리 의존성이 있는 모듈 (예: ConfigModule) */
  imports?: any[];
  /** 팩토리에 주입할 프로바이더 토큰 목록 (예: ConfigService) */
  inject?: any[];
  /** SendgoConfig를 생성하는 팩토리 함수 */
  useFactory: (...args: any[]) => SendgoConfig | Promise<SendgoConfig>;
}

/**
 * Sendgo를 NestJS 애플리케이션에 통합하는 전역 모듈.
 *
 * @example
 * // 정적 설정
 * SendgoModule.forRoot({
 *   accessKey: process.env.SENDGO_ACCESS_KEY!,
 *   secretKey: process.env.SENDGO_SECRET_KEY!,
 *   kakaoSenderKey: process.env.SENDGO_KAKAO_KEY,
 *   smsSenderKey: process.env.SENDGO_SMS_KEY,
 * })
 *
 * @example
 * // 비동기 설정 (ConfigService 사용)
 * SendgoModule.forRootAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({
 *     accessKey: config.getOrThrow('SENDGO_ACCESS_KEY'),
 *     secretKey: config.getOrThrow('SENDGO_SECRET_KEY'),
 *   }),
 * })
 */
@Global()
@Module({})
export class SendgoModule {
  /** 정적 설정으로 Sendgo 모듈을 등록합니다. */
  static forRoot(options: SendgoConfig): DynamicModule {
    const optionsProvider: Provider = {
      provide: SENDGO_OPTIONS,
      useValue: options,
    };

    return {
      module: SendgoModule,
      providers: [optionsProvider, this.createClientProvider(), SendgoService],
      exports: [Sendgo, SendgoService],
    };
  }

  /** 비동기 팩토리로 Sendgo 모듈을 등록합니다. */
  static forRootAsync(options: SendgoModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: SENDGO_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };

    return {
      module: SendgoModule,
      imports: options.imports ?? [],
      providers: [optionsProvider, this.createClientProvider(), SendgoService],
      exports: [Sendgo, SendgoService],
    };
  }

  /** SENDGO_OPTIONS로부터 Sendgo 인스턴스를 생성하는 프로바이더 */
  private static createClientProvider(): Provider {
    return {
      provide: Sendgo,
      useFactory: (config: SendgoConfig) => new Sendgo(config),
      inject: [SENDGO_OPTIONS],
    };
  }
}
