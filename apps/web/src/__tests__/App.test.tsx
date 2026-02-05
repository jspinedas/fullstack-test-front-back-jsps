import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import App from '../App';

describe('App', () => {
  it('renders App inicializada message', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    const heading = screen.getByText(/app inicializada/i);
    expect(heading).toBeInTheDocument();
  });
});
