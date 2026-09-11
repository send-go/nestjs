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

  // -------------------------------------------------------- 관리 API (v2 전용)
  // 콘솔에서만 되던 등록·심사. 대부분 즉시 완료되지 않는다 — 등록 성공은
  // "접수됨"이지 "사용 가능"이 아니다.

  /** 카카오 발신프로필(채널) 등록·동기화. v2 전용, 기업 계정 전용. */
  get kakaoSenders(): Sendgo['kakaoSenders'] {
    return this.sendgo.kakaoSenders;
  }

  /** 알림톡 템플릿 등록·수정·검수 요청. v2 전용, 기업 계정 전용. */
  get noticeTemplates(): Sendgo['noticeTemplates'] {
    return this.sendgo.noticeTemplates;
  }

  /** 브랜드메시지(구 친구톡) 템플릿 관리. v2 전용, 기업 계정 전용. */
  get brandTemplates(): Sendgo['brandTemplates'] {
    return this.sendgo.brandTemplates;
  }

  /** 발신번호 등록·심사 접수. v2 전용. */
  get senderRegistration(): Sendgo['senderRegistration'] {
    return this.sendgo.senderRegistration;
  }

  /** 문자 상용구 템플릿. v2 전용. */
  get messageTemplates(): Sendgo['messageTemplates'] {
    return this.sendgo.messageTemplates;
  }

  /** 카카오 이미지 업로드 — 브랜드메시지 템플릿용 URL 발급. v2 전용, 기업 계정 전용. */
  get kakaoImages(): Sendgo['kakaoImages'] {
    return this.sendgo.kakaoImages;
  }

  /** 수신거부(080) 번호 조회. v2 전용. */
  get rejectedNumbers(): Sendgo['rejectedNumbers'] {
    return this.sendgo.rejectedNumbers;
  }

  /** 이벤트 웹훅 구독 — 등록·심사 결과를 밀어 받는다. v2 전용. */
  get webhook(): Sendgo['webhook'] {
    return this.sendgo.webhook;
  }

  /** 원본 Sendgo 클라이언트 인스턴스 */
  get client(): Sendgo {
    return this.sendgo;
  }
}
