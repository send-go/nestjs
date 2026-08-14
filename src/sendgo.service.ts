import { Injectable } from '@nestjs/common';
import { Sendgo } from '@sendgo/node';

/**
 * Sendgo 클라이언트를 감싸는 NestJS 주입형 서비스.
 *
 * `SendgoModule.forRoot()` 또는 `forRootAsync()`로 등록하면
 * 어디서든 생성자 주입으로 사용할 수 있습니다.
 *
 * @example
 * @Injectable()
 * export class NotificationService {
 *   constructor(private readonly sendgo: SendgoService) {}
 *
 *   async notify(phone: string, orderNo: string) {
 *     await this.sendgo.alimtalk.send({
 *       templateCode: 'ORDER_CONFIRM_001',
 *       contacts: [{ contact: phone, var1: orderNo }],
 *     });
 *   }
 * }
 */
@Injectable()
export class SendgoService {
  constructor(private readonly sendgo: Sendgo) {}

  /** 카카오 알림톡 전송 */
  get alimtalk(): Sendgo['alimtalk'] {
    return this.sendgo.alimtalk;
  }

  /**
   * 카카오 친구톡 전송.
   *
   * @deprecated 친구톡은 2025-12-31 종료되었습니다. 2026-01-01 부터 친구톡 발송
   * 요청은 카카오 측에서 브랜드메시지(자유형)로 자동 대체 발송됩니다.
   * 신규 연동은 `brandMessage` 를 사용하세요.
   */
  get friendtalk(): Sendgo['friendtalk'] {
    return this.sendgo.friendtalk;
  }

  /** 카카오 브랜드메시지 — 친구톡의 후속 채널. v2 전용. */
  get brandMessage(): Sendgo['brandMessage'] {
    return this.sendgo.brandMessage;
  }

  /** 짧은 URL — 링크 단축과 클릭 반응 분석. v2 전용. */
  get shortUrl(): Sendgo['shortUrl'] {
    return this.sendgo.shortUrl;
  }

  /** SMS / LMS / MMS 전송 */
  get sms(): Sendgo['sms'] {
    return this.sendgo.sms;
  }

  /** 원본 Sendgo 클라이언트 인스턴스 */
  get client(): Sendgo {
    return this.sendgo;
  }
}
