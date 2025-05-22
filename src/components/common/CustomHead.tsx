import Head from 'next/head';

const CustomHead = () => {
  return (
    <Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
};

export default CustomHead; 