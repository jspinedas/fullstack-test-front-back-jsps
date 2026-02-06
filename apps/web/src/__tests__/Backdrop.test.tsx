import { render, fireEvent } from '@testing-library/react';
import Backdrop from '../components/Backdrop';

describe('Backdrop', () => {
  it('calls onClose when clicking the overlay', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Backdrop onClose={onClose}>
        <div>Content</div>
      </Backdrop>,
    );

    const overlay = container.querySelector('.backdrop-overlay') as HTMLElement;
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking the card', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Backdrop onClose={onClose}>
        <div>Content</div>
      </Backdrop>,
    );

    const card = container.querySelector('.backdrop-card') as HTMLElement;
    fireEvent.click(card);

    expect(onClose).not.toHaveBeenCalled();
  });
});
