import { SandboxHttpAdapter } from './sandbox-http.adapter';

describe('SandboxHttpAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SANDBOX_BASE_URL: 'https://sandbox.test',
      SANDBOX_PRIVATE_KEY: 'private-key',
      SANDBOX_PUBLIC_KEY: 'public-key',
      SANDBOX_EVENTS_KEY: 'events-key',
      SANDBOX_INTEGRITY_KEY: 'integrity-key',
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it('returns success when payment is approved', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'tok-1' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { presigned_acceptance: { acceptance_token: 'acc-1' } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'tx-1', status: 'APPROVED' } }),
      });

    const adapter = new SandboxHttpAdapter();
    const result = await adapter.createCardPayment({
      amount: 100,
      currency: 'COP',
      cardNumber: '4111111111111111',
      cardExpMonth: '12',
      cardExpYear: '25',
      cardCvc: '123',
      cardHolder: 'John Doe',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('SUCCESS');
      expect(result.value.providerTransactionId).toBe('tx-1');
    }
  });

  it('returns invalid card when token creation fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const adapter = new SandboxHttpAdapter();
    const result = await adapter.createCardPayment({
      amount: 100,
      currency: 'COP',
      cardNumber: '4111111111111111',
      cardExpMonth: '12',
      cardExpYear: '25',
      cardCvc: '123',
      cardHolder: 'John Doe',
    });

    expect(result).toEqual({ ok: false, error: 'INVALID_CARD' });
  });

  it('returns failed status when provider declines payment', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'tok-2' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { presigned_acceptance: { acceptance_token: 'acc-2' } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'tx-2',
            status: 'DECLINED',
            status_message: 'Card declined',
          },
        }),
      });

    const adapter = new SandboxHttpAdapter();
    const result = await adapter.createCardPayment({
      amount: 200,
      currency: 'COP',
      cardNumber: '4111111111111111',
      cardExpMonth: '12',
      cardExpYear: '25',
      cardCvc: '123',
      cardHolder: 'John Doe',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('FAILED');
      expect(result.value.failureReason).toBe('Card declined');
    }
  });

  it('returns processing when provider response is pending', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'tok-3' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { presigned_acceptance: { acceptance_token: 'acc-3' } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'tx-3', status: 'PENDING' } }),
      });

    const adapter = new SandboxHttpAdapter();
    const result = await adapter.createCardPayment({
      amount: 300,
      currency: 'COP',
      cardNumber: '4111111111111111',
      cardExpMonth: '12',
      cardExpYear: '25',
      cardCvc: '123',
      cardHolder: 'John Doe',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('PROCESSING');
      expect(result.value.providerTransactionId).toBe('tx-3');
    }
  });

  it('returns card declined when transaction response is not ok', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'tok-4' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { presigned_acceptance: { acceptance_token: 'acc-4' } },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const adapter = new SandboxHttpAdapter();
    const result = await adapter.createCardPayment({
      amount: 400,
      currency: 'COP',
      cardNumber: '4111111111111111',
      cardExpMonth: '12',
      cardExpYear: '25',
      cardCvc: '123',
      cardHolder: 'John Doe',
    });

    expect(result).toEqual({ ok: false, error: 'CARD_DECLINED' });
  });

  it('returns provider unavailable on network failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const adapter = new SandboxHttpAdapter();
    const result = await adapter.createCardPayment({
      amount: 100,
      currency: 'COP',
      cardNumber: '4111111111111111',
      cardExpMonth: '12',
      cardExpYear: '25',
      cardCvc: '123',
      cardHolder: 'John Doe',
    });

    expect(result).toEqual({ ok: false, error: 'PROVIDER_UNAVAILABLE' });
  });
});
