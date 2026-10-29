import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Home from '@/views/Home.vue';
import EndPointAccess from '@/services/EndPointAccess';

describe('Aktivitas 8 - Fintech Modern Crypto Ticker', () => {
  test('EndPointAccess initializes coinlore API URL correctly', () => {
    const service = new EndPointAccess('https://api.coinlore.net/api/tickers/');
    expect(service.theUrl).toBe('https://api.coinlore.net/api/tickers/');
  });

  test('renders Fintech Home view with Refresh button and Brand title', () => {
    const wrapper = mount(Home);
    expect(wrapper.text()).toContain('Refresh');
    expect(wrapper.text()).toContain('Crypto Markets');
  });

  test('renders crypto items with rank, name, symbol, and price_usd', async () => {
    const wrapper = mount(Home);
    await wrapper.setData({
      cryptoData: [
        {
          id: '90',
          symbol: 'BTC',
          name: 'Bitcoin',
          rank: 1,
          price_usd: '27604.54',
          percent_change_24h: '1.25',
        },
        {
          id: '80',
          symbol: 'ETH',
          name: 'Ethereum',
          rank: 2,
          price_usd: '1720.54',
          percent_change_24h: '-0.75',
        },
      ],
    });
    expect(wrapper.text()).toContain('BTC');
    expect(wrapper.text()).toContain('Bitcoin');
    expect(wrapper.text()).toContain('Rank #1');
    expect(wrapper.text()).toContain('27,604.54');
    expect(wrapper.text()).toContain('ETH');
    expect(wrapper.text()).toContain('Ethereum');
    expect(wrapper.text()).toContain('Rank #2');
    expect(wrapper.text()).toContain('1,720.54');
  });
});
