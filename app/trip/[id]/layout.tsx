const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
};

const metadata = {
  title: 'Trips',
  description: 'Explore walking paths from around the world.',
  image: 'https://example.com/image.jpg',
};

export { metadata };

export default RootLayout;
