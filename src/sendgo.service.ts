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

  /** 카카오 친구톡 전송 */
  get friendtalk(): Sendgo['friendtalk'] {
    return this.sendgo.friendtalk;
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
