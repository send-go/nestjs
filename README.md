# @sendgo/nestjs

> **NestJS에서 카카오 알림톡, 브랜드메시지, SMS를 가장 쉽게 발송하는 공식 NestJS 모듈**

[![npm](https://img.shields.io/npm/v/@sendgo/nestjs)](https://www.npmjs.com/package/@sendgo/nestjs)
[![NestJS](https://img.shields.io/badge/NestJS-10%2B-E0234E?logo=nestjs)](https://nestjs.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

`@sendgo/nestjs`는 [`@sendgo/node`](https://github.com/send-go/node) 코어를 확장한 **NestJS 전용 모듈**입니다.
`DynamicModule` 기반의 `forRoot` / `forRootAsync` 등록, 전역(Global) 프로바이더, 생성자 주입(DI)을 완벽하게 제공합니다.

---

## 목차

- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [비동기 설정 (ConfigService)](#비동기-설정-configservice)
- [상세 사용법](#상세-사용법)
  - [알림톡](#알림톡)
  - [친구톡](#친구톡)
  - [SMS / LMS / MMS](#sms--lms--mms)
- [서비스 클래스 패턴](#서비스-클래스-패턴)
- [예외 처리](#예외-처리)
- [설정 옵션](#설정-옵션)
- [자주 묻는 질문 (FAQ)](#자주-묻는-질문-faq)
- [관련 패키지](#관련-패키지)

---

## 설치

```bash
npm install @sendgo/nestjs @sendgo/node
```

`@nestjs/common`은 peerDependency이므로 NestJS 프로젝트에 이미 설치되어 있어야 합니다.

---

## 빠른 시작

### 1단계 — 모듈 등록 (`app.module.ts`)

```ts
import { Module } from '@nestjs/common';
import { SendgoModule } from '@sendgo/nestjs';

@Module({
  imports: [
    SendgoModule.forRoot({
      accessKey: process.env.SENDGO_ACCESS_KEY!,
      secretKey: process.env.SENDGO_SECRET_KEY!,
      kakaoSenderKey: process.env.SENDGO_KAKAO_KEY,
      smsSenderKey: process.env.SENDGO_SMS_KEY,
      apiVersion: 'v2',
    }),
  ],
})
export class AppModule {}
```

`SendgoModule`은 `@Global()`이므로 한 번만 등록하면 어느 모듈에서든 `SendgoService`를 주입할 수 있습니다.

### 2단계 — 서비스 주입 후 발송

```ts
import { Injectable } from '@nestjs/common';
import { SendgoService } from '@sendgo/nestjs';

@Injectable()
export class OrderService {
  constructor(private readonly sendgo: SendgoService) {}

  async confirm(phone: string, orderNo: string, amount: number) {
    await this.sendgo.alimtalk.send({
      templateCode: 'ORDER_CONFIRM_001',
      contacts: [
        { contact: phone, var1: orderNo, var2: `${amount.toLocaleString()}원` },
      ],
    });
  }
}
```

---

## 비동기 설정 (ConfigService)

환경변수를 `@nestjs/config`의 `ConfigService`로 주입해 설정을 구성할 수 있습니다.

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendgoModule } from '@sendgo/nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SendgoModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        accessKey: config.getOrThrow('SENDGO_ACCESS_KEY'),
        secretKey: config.getOrThrow('SENDGO_SECRET_KEY'),
        kakaoSenderKey: config.get('SENDGO_KAKAO_KEY'),
        smsSenderKey: config.get('SENDGO_SMS_KEY'),
        apiVersion: config.get('SENDGO_API_VERSION') ?? 'v1',
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 상세 사용법

모든 발송 메서드는 `SendgoService`의 게터(`alimtalk`, `friendtalk`, `sms`)를 통해 코어 클라이언트에 위임됩니다.

### 알림톡

```ts
// 다건 발송
await this.sendgo.alimtalk.send({
  templateCode: 'ORDER_CONFIRM_001',
  contacts: [
    { contact: '01011111111', name: '홍길동', var1: 'ORD-001', var2: '29,000원' },
    { contact: '01022222222', name: '김철수', var1: 'ORD-002', var2: '15,000원' },
  ],
});

// 예약 발송
await this.sendgo.alimtalk.send({
  templateCode: 'PROMO_SUMMER_2026',
  scheduleType: 'SCHEDULED',
  at: '2026-07-28 09:00:00',
  contacts: [{ contact: '01012345678', var1: '여름 한정 50% 할인' }],
});

// SMS 자동 대체 발송
await this.sendgo.alimtalk.send({
  templateCode: 'DELIVERY_START_001',
  replaceSms: 'Y',
  smsSubject: '[배송 시작 안내]',
  smsContent: '주문하신 상품이 출고되었습니다.\n송장번호: #{var2}',
  contacts: [{ contact: '01012345678', var1: 'ORD-001', var2: '1234567890' }],
});
```

### 친구톡

> ⚠️ **Deprecated — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었습니다.**
> 2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 **브랜드메시지(자유형)** 로 자동 대체 발송됩니다.
> 호출은 계속 성공하며, 자유 본문 타입(`FT`/`FI`/`FW`)을 개별 수신자에게 보내는 경로는
> 현재 이것뿐이므로 기존 코드를 당장 바꿀 필요는 없습니다.
>
> 다음의 경우에는 **브랜드메시지**를 사용하세요.
> - 템플릿 기반 리치 타입 (`FL`/`FC`/`FM`/`FP`/`FA`)
> - 채널 친구가 **아닌** 수신자 (`targeting` = `N` / `I`)
> - 수신 동의한 전체 채널 친구 동보 (`targeting` = `F`)
>
> 메시지 타입은 1:1 대응되며 변환은 서버가 처리합니다 — `FT`→`BT`, `FI`→`BI`, `FW`→`BW`,
> `FL`→`BL`, `FC`→`BC`, `FM`→`BM`, `FP`→`BP`, `FA`→`BA`.

```ts
// 텍스트형
await this.sendgo.friendtalk.send({
  content: '안녕하세요! 7월 한정 특가 이벤트를 확인해보세요.',
  contacts: [{ contact: '01012345678' }],
});

// 이미지형
await this.sendgo.friendtalk.send({
  messageType: 'FI',
  content: '이번 주 특가 상품을 확인하세요!',
  imageUrl: 'https://cdn.example.com/banner.jpg',
  imageLink: 'https://example.com/event',
  contacts: [{ contact: '01012345678' }],
});

// 버튼 포함
await this.sendgo.friendtalk.send({
  content: '7월 쿠폰이 도착했습니다! 지금 바로 사용하세요.',
  buttons: [
    { name: '쿠폰 받기', type: 'WL', linkMo: 'https://example.com/coupon' },
    { name: '고객센터', type: 'WL', linkMo: 'https://example.com/cs' },
  ],
  contacts: [{ contact: '01012345678' }],
});
```

### SMS / LMS / MMS

```ts
// SMS (90자 이하)
await this.sendgo.sms.sendSms({
  content: '[Sendgo] 인증번호: 123456 (5분 이내 입력)',
  contacts: [{ contact: '01012345678' }],
});

// LMS (장문, 2,000자 이하)
await this.sendgo.sms.sendLms({
  subject: '[중요] 서비스 점검 안내',
  content: '안녕하세요. 서비스 점검이 예정되어 있습니다.\n\n■ 일시: 2026-07-25 02:00 ~ 06:00',
  contacts: [{ contact: '01012345678' }],
});

// MMS (멀티미디어)
await this.sendgo.sms.sendMms({
  subject: '[이벤트] 7월 특가',
  content: '이번 달 특가 상품을 확인하세요!',
  contacts: [{ contact: '01011111111' }, { contact: '01022222222' }],
});
```

---

## 서비스 클래스 패턴

```ts
// notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SendgoService, SendgoError } from '@sendgo/nestjs';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly sendgo: SendgoService) {}

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    try {
      // 알림톡 우선, 실패 시 SMS 대체
      await this.sendgo.alimtalk.send({
        templateCode: 'VERIFY_CODE_001',
        replaceSms: 'Y',
        smsContent: `[인증] 인증번호: ${code} (5분 이내 입력)`,
        contacts: [{ contact: phone, var1: code }],
      });
    } catch (e) {
      if (e instanceof SendgoError) {
        this.logger.error(`Sendgo 인증번호 발송 실패: ${e.message}`);
      }
      throw e;
    }
  }
}
```

원본 코어 클라이언트가 필요하면 `this.sendgo.client`로 접근할 수 있습니다.
또한 `Sendgo` 클래스 토큰으로 코어 인스턴스를 직접 주입받는 것도 가능합니다.

```ts
import { Injectable } from '@nestjs/common';
import { Sendgo } from '@sendgo/node';

@Injectable()
export class OrderService {
  constructor(private readonly sendgo: Sendgo) {}
}
```

---

## 예외 처리

```ts
import { SendgoError } from '@sendgo/nestjs';

try {
  await this.sendgo.alimtalk.send({ /* ... */ });
} catch (e) {
  if (e instanceof SendgoError) {
    // e.errorCode, e.statusCode, e.endpoint 활용 가능
    switch (e.errorCode) {
      case 'INVALID_ACCESS_KEY':
      case 'INVALID_SECRET_KEY':
        // 인증키 오류 처리
        break;
      case 'INVALID_TEMPLATE_CODE':
        // 존재하지 않는 템플릿
        break;
      case 'PAYMENT_REQUIRED':
        // 크레딧 부족
        break;
      default:
        break;
    }
  }
  throw e;
}
```

---

## 설정 옵션

`SendgoModule.forRoot()` / `forRootAsync()`에 전달하는 `SendgoConfig` 값입니다.

| 키 | 타입 | 기본값 | 설명 |
|----|------|--------|------|
| `accessKey` | `string` | — | Sendgo 액세스 키 (필수) |
| `secretKey` | `string` | — | Sendgo 시크릿 키 (필수) |
| `kakaoSenderKey` | `string` | `''` | 카카오 발신프로필 키 |
| `smsSenderKey` | `string` | `''` | SMS 발신자 키 |
| `apiVersion` | `'v1' \| 'v2'` | `'v1'` | API 버전 |
| `baseUrl` | `string` | `'https://sendgo.io'` | API 기본 URL |

---

## 자주 묻는 질문 (FAQ)

**Q. `@sendgo/node`와의 차이는 무엇인가요?**
A. `@sendgo/node`는 프레임워크 독립적인 순수 Node.js 코어 SDK입니다. `@sendgo/nestjs`는 이를 확장해 `DynamicModule` 등록, 전역 프로바이더, 생성자 주입 등 NestJS 통합을 추가합니다.

**Q. NestJS 10, 11 모두 지원하나요?**
A. 네, `@nestjs/common` `>=10.0.0`을 peerDependency로 지원합니다.

**Q. `SendgoService` 대신 코어 클라이언트를 직접 주입할 수 있나요?**
A. 네, `Sendgo` 클래스를 토큰으로 주입받으면 코어 인스턴스를 직접 사용할 수 있습니다.

**Q. 테스트 시 Sendgo를 Mock 처리하려면?**
A. 테스트 모듈에서 `SendgoService` 또는 `Sendgo` 프로바이더를 mock 값으로 오버라이드하면 됩니다.

---

## 관련 패키지

| 언어/프레임워크 | 패키지 | GitHub |
|----------------|--------|--------|
| Node.js (순수) | `@sendgo/node` | [node](https://github.com/send-go/node) |
| React / Next.js | `@sendgo/react` | [react](https://github.com/send-go/react) |
| Vue / Nuxt | `@sendgo/vue` | [vue](https://github.com/send-go/vue) |
| Laravel | `sendgo/laravel` | [laravel](https://github.com/send-go/laravel) |
| 전체 목록 | — | [send-go GitHub 조직](https://github.com/send-go) |

---

## 브랜드메시지 · 짧은 URL

이 패키지는 코어(`@sendgo/node`)의 클라이언트를 그대로 노출하므로, 코어에 있는 채널이
모두 그대로 쓸 수 있습니다. 두 기능 모두 **v2 전용**입니다.

| 기능 | 접근 |
|------|------|
| 카카오 브랜드메시지 (친구톡의 후속 채널) | `sendgo.brandMessage` |
| 짧은 URL (단축 + 클릭 반응 분석) | `sendgo.shortUrl` |

브랜드메시지는 채널 친구가 아닌 수신자에게도 보낼 수 있고(`targeting` = `N`),
수신 동의한 전체 채널 친구에게 동보 발송할 수도 있습니다(`targeting` = `F`).

짧은 URL 은 메시지 본문의 링크를 줄이고 클릭 반응(일별 추이·디바이스·유입경로·국가)을
집계합니다.

사용 예시와 파라미터는 [코어 README](https://github.com/send-go) 와
[SDK 가이드](https://sendgo.io/ko/sdk) 를 참고하세요.

## 변경 사항

### 1.2.1 (2026-08-14)

- 레지스트리 목록에 노출되는 패키지 설명에서 친구톡을 브랜드메시지로 교체했습니다.
  npm/PyPI/Packagist/Maven/NuGet/RubyGems 검색 결과에 그대로 찍히는 문자열이라
  종료된 채널을 계속 홍보하고 있었습니다.
- 검색 키워드에 `brand-message` 를 추가했습니다 (`friendtalk` 은 유입 검색어라 유지).

### 1.2.0 (2026-08-14)

- **친구톡 Deprecated 표기** — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었고,
  2026-01-01 부터 발송 요청이 브랜드메시지(자유형)로 자동 대체 발송됩니다.
  관련 API 에 각 언어의 표준 deprecation 표기를 달았습니다.
- 자유 본문 타입(`FT`/`FI`/`FW`)의 개별 발송 경로는 아직 친구톡 API 뿐이라는 점을
  문서에 명시했습니다 — 브랜드메시지 API 는 그 조합에 `NOT_A_BRAND_MESSAGE` 를 반환합니다.
- 브랜드메시지 전환 안내와 메시지 타입 1:1 대응표를 README 에 추가했습니다.

### 1.1.0 (2026-08-11)

- `SendgoService.shortUrl` 게터 추가

## 라이선스

MIT License © 2026 [Sendgo](https://sendgo.io)

---

*키워드: 카카오 알림톡 NestJS, 카카오 친구톡 NestJS, SMS 발송 NestJS, 알림톡 NestJS 모듈, NestJS 카카오 API 연동, Sendgo NestJS SDK*
