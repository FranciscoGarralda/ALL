import '../styles/globals.css';
import Head from 'next/head';
import ErrorBoundary from '../shared/components/ui/ErrorBoundary';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Alliance F&R - Sistema Financiero</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Sistema integral de gestión financiera - Alliance F&R" />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}