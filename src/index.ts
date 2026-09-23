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

// 계정 API는 서버 코드에서만 사용합니다.
export { AccountClient } from '@sendgo/node';
export type { AccountConfig, AccountResponse, ApiKeyCreateParams, AllowedIpParams } from '@sendgo/node';

export { TemplateFolderService } from '@sendgo/node';
export type { TemplateFolderType, TemplateFolderListParams, TemplateFolderCreateParams, TemplateFolderAssignParams } from '@sendgo/node';
