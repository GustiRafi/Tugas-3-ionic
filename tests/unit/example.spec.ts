import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import Home from '@/views/Home.vue';
import EndPointAccess from '@/services/EndPointAccess';

describe('Aktivitas 8 - Soal Tugas Cryptocurrency', () => {
  test('EndPointAccess initializes coinlore API URL correctly', () => {
    const service = new EndPointAccess('https://api.coinlore.net/api/tickers/');
    expect(service.theUrl).toBe('https://api.coinlore.net/api/tickers/');
  });

  test('renders Home view with Refresh button', () => {
    const wrapper = mount(Home);
    expect(wrapper.text()).toContain('Refresh');
  });

  test('renders crypto rows when data is provided', async () => {
    const wrapper = mount(Home);
    await wrapper.setData({
      cryptoData: [
        { id: '90', symbol: 'BTC', name: 'Bitcoin', rank: 1, price_usd: '27604.54' },
        { id: '80', symbol: 'ETH', name: 'Ethereum', rank: 2, price_usd: '1720.54' },
      ],
    });
    expect(wrapper.text()).toContain('Rank');
    expect(wrapper.text()).toContain('BTC');
    expect(wrapper.text()).toContain('Bitcoin');
    expect(wrapper.text()).toContain('27604.54');
    expect(wrapper.text()).toContain('ETH');
    expect(wrapper.text()).toContain('Ethereum');
    expect(wrapper.text()).toContain('1720.54');
  });
});
