import dotenv from 'dotenv';

dotenv.config();

interface PaymentInitiation {
  email: string;
  amount: number; // In base units (e.g., cents/kobo)
  currency: string;
  reference: string;
  metadata: any;
  callbackUrl: string;
}

interface PaymentResponse {
  authorization_url: string;
  access_code?: string;
  reference: string;
}

class PaymentService {
  private paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  private stripeSecret = process.env.STRIPE_SECRET_KEY;

  async initiatePayment(gateway: 'PAYSTACK' | 'STRIPE' | 'SIMULATOR', data: PaymentInitiation): Promise<PaymentResponse> {
    if (gateway === 'SIMULATOR' || (!this.paystackSecret && !this.stripeSecret)) {
      console.log(`[PaymentService] Simulating ${gateway} payment for ${data.reference}`);
      // Return a simulation URL that redirects back to our frontend verify page
      return {
        authorization_url: `${data.callbackUrl}?reference=${data.reference}&status=success&simulated=true`,
        reference: data.reference
      };
    }

    if (gateway === 'PAYSTACK') {
      return this.initiatePaystack(data);
    } 
    
    if (gateway === 'STRIPE') {
      return this.initiateStripe(data);
    }

    throw new Error('Unsupported gateway');
  }

  async verifyPayment(gateway: 'PAYSTACK' | 'STRIPE' | 'SIMULATOR', reference: string): Promise<boolean> {
    if (gateway === 'SIMULATOR' || (!this.paystackSecret && !this.stripeSecret)) {
      return true; // Always valid in simulation
    }

    if (gateway === 'PAYSTACK') {
      // Mock Paystack verification call
      // In prod: axios.get(`https://api.paystack.co/transaction/verify/${reference}`)
      return true; 
    }

    if (gateway === 'STRIPE') {
      // Mock Stripe verification
      return true;
    }

    return false;
  }

  private async initiatePaystack(data: PaymentInitiation): Promise<PaymentResponse> {
    // Implementation would use axios to call https://api.paystack.co/transaction/initialize
    // For now, we simulate success if key exists but logic is blocked by environment constraints
    return {
      authorization_url: `${data.callbackUrl}?reference=${data.reference}&status=success&gateway=paystack`,
      reference: data.reference,
      access_code: 'simulated_access_code'
    };
  }

  private async initiateStripe(data: PaymentInitiation): Promise<PaymentResponse> {
    // Implementation would use stripe.paymentIntents.create
    return {
      authorization_url: `${data.callbackUrl}?reference=${data.reference}&status=success&gateway=stripe`,
      reference: data.reference
    };
  }
}

export const paymentService = new PaymentService();
