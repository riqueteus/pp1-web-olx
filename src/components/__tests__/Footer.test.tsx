import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders the footer with current year', () => {
    // Arrange
    const currentYear = new Date().getFullYear();
    
    // Act
    render(<Footer />);
    
    // Assert
    const footerElement = screen.getByRole('contentinfo');
    const yearText = screen.getByText(`© ${currentYear} PP1 OLX`);
    
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveClass('border-t', 'border-gray-200', 'py-4', 'text-center');
    expect(yearText).toBeInTheDocument();
  });

  it('has the correct container structure', () => {
    // Act
    const { container } = render(<Footer />);
    
    // Assert
    const divElement = container.querySelector('div');
    expect(divElement).toHaveClass('mx-auto', 'px-4', 'text-sm', 'text-gray-500');
  });
});