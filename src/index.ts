// @sendgo/nestjs — Sendgo NestJS 모듈 공개 API
export { SendgoModule, SendgoModuleAsyncOptions } from './sendgo.module';
export { SendgoService } from './sendgo.service';
export { SENDGO_OPTIONS } from './sendgo.constants';

// @sendgo/node 코어 타입 재노출
export type {
  ShortUrlParams,
  ShortUrlListParams,
  ShortUrlStatsParams,
  SendgoConfig,
  Contact,
  AlimtalkParams,
  FriendtalkParams,
  SmsParams,
  SendgoResponse,
} from '@sendgo/node';
export { SendgoError } from '@sendgo/node';
