declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
  }
}

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  callback: (response: any) => void;
  onclose?: () => void;
}

export const openFlutterwavePayment = (config: FlutterwaveConfig) => {
  const triggerModal = () => {
    if (window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout(config);
    } else {
      alert("Flutterwave checkout gateway is loading or unavailable offline.");
    }
  };

  if (window.FlutterwaveCheckout) {
    triggerModal();
    return;
  }

  const existingScript = document.getElementById('flutterwave-js');
  if (existingScript) {
    existingScript.addEventListener('load', triggerModal);
    return;
  }

  const script = document.createElement('script');
  script.id = 'flutterwave-js';
  script.src = 'https://checkout.flutterwave.com/v3.js';
  script.async = true;
  script.onload = () => triggerModal();
  script.onerror = () => {
    alert("Unable to load Flutterwave online payment gateway. Please check connection.");
  };
  document.body.appendChild(script);
};
