import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';

test('renders EconLens app', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
  
  // Check if the main layout elements are present
  expect(screen.getByText('EconLens')).toBeInTheDocument();
  expect(screen.getByText('Portfolio Analysis')).toBeInTheDocument();
});
