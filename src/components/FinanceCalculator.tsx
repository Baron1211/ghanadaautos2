import { useMemo, useState } from "react";

type Frequency = "monthly" | "biweekly" | "weekly";

const frequencySettings: Record<Frequency, { periodsPerYear: number; label: string; displayName: string }> = {
  monthly: { periodsPerYear: 12, label: "Monthly Payment", displayName: "Monthly" },
  biweekly: { periodsPerYear: 26, label: "Bi-weekly Payment", displayName: "Bi-weekly" },
  weekly: { periodsPerYear: 52, label: "Weekly Payment", displayName: "Weekly" },
};

const toNumber = (value: string | number) => {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, value));

const calculateAmountFinanced = (vehiclePrice: number, tradeInValue: number, outstandingLoan: number, downPayment: number) =>
  Math.max(0, vehiclePrice + outstandingLoan - tradeInValue - downPayment);

function calculateLoanPayment(principal: number, annualInterestRate: number, loanMonths: number, frequency: Frequency) {
  const settings = frequencySettings[frequency];
  if (principal <= 0 || loanMonths <= 0) return { paymentAmount: 0, numberOfPayments: 0, totalInterest: 0, totalPayable: 0 };
  const numberOfPayments = Math.round((loanMonths / 12) * settings.periodsPerYear);
  const periodicRate = annualInterestRate / 100 / settings.periodsPerYear;
  let paymentAmount: number;
  if (periodicRate === 0) {
    paymentAmount = principal / numberOfPayments;
  } else {
    const growthFactor = Math.pow(1 + periodicRate, numberOfPayments);
    paymentAmount = (principal * (periodicRate * growthFactor)) / (growthFactor - 1);
  }
  const totalPayable = paymentAmount * numberOfPayments;
  return { paymentAmount, numberOfPayments, totalInterest: Math.max(0, totalPayable - principal), totalPayable };
}

function calculateMaximumLoan(affordablePayment: number, annualInterestRate: number, loanMonths: number, frequency: Frequency) {
  const settings = frequencySettings[frequency];
  if (affordablePayment <= 0 || loanMonths <= 0) return { maximumLoan: 0, numberOfPayments: 0 };
  const numberOfPayments = Math.round((loanMonths / 12) * settings.periodsPerYear);
  const periodicRate = annualInterestRate / 100 / settings.periodsPerYear;
  let maximumLoan: number;
  if (periodicRate === 0) {
    maximumLoan = affordablePayment * numberOfPayments;
  } else {
    const growthFactor = Math.pow(1 + periodicRate, numberOfPayments);
    maximumLoan = (affordablePayment * (growthFactor - 1)) / (periodicRate * growthFactor);
  }
  return { maximumLoan: Math.max(0, maximumLoan), numberOfPayments };
}

export default function FinanceCalculator({
  vehiclePrice: initialPrice = 180000,
  onApply,
  onCallBack,
}: {
  vehiclePrice?: number;
  onApply?: () => void;
  onCallBack?: () => void;
}) {
  const [mode, setMode] = useState<"payment" | "budget">("payment");
  const [paymentFrequency, setPaymentFrequency] = useState<Frequency>("monthly");
  const [vehiclePrice, setVehiclePrice] = useState(String(Math.round(initialPrice) || 180000));
  const [affordablePayment, setAffordablePayment] = useState("3000");
  const [tradeInValue, setTradeInValue] = useState("0");
  const [outstandingLoan, setOutstandingLoan] = useState("0");
  const [downPayment, setDownPayment] = useState(String(Math.round((initialPrice || 180000) * 0.2)));
  const [interestRate, setInterestRate] = useState("18");
  const [loanMonths, setLoanMonths] = useState("60");
  const [budgetFrequency, setBudgetFrequency] = useState<Frequency>("monthly");

  const inputs = {
    vehiclePrice: toNumber(vehiclePrice),
    affordablePayment: toNumber(affordablePayment),
    tradeInValue: toNumber(tradeInValue),
    outstandingLoan: toNumber(outstandingLoan),
    downPayment: toNumber(downPayment),
    annualInterestRate: toNumber(interestRate),
    loanMonths: Number.parseInt(loanMonths, 10) || 0,
  };

  const errors = useMemo(() => {
    const e: string[] = [];
    if (mode === "payment" && inputs.vehiclePrice <= 0) e.push("Please enter a valid vehicle price.");
    if (mode === "budget" && inputs.affordablePayment <= 0) e.push("Please enter an affordable payment amount.");
    if (inputs.tradeInValue < 0) e.push("Trade-in value cannot be negative.");
    if (inputs.outstandingLoan < 0) e.push("Outstanding loan balance cannot be negative.");
    if (inputs.downPayment < 0) e.push("Down payment cannot be negative.");
    if (inputs.annualInterestRate < 0 || inputs.annualInterestRate > 40) e.push("Interest rate must be between 0% and 40%.");
    if (inputs.loanMonths < 12 || inputs.loanMonths > 120) e.push("Loan duration must be between 12 and 120 months.");
    return e;
  }, [mode, JSON.stringify(inputs)]);

  const valid = errors.length === 0;
  const amountFinanced = calculateAmountFinanced(inputs.vehiclePrice, inputs.tradeInValue, inputs.outstandingLoan, inputs.downPayment);
  const loanResult = calculateLoanPayment(amountFinanced, inputs.annualInterestRate, inputs.loanMonths, paymentFrequency);
  const budgetResult = calculateMaximumLoan(inputs.affordablePayment, inputs.annualInterestRate, inputs.loanMonths, budgetFrequency);
  const maximumVehiclePrice = Math.max(0, budgetResult.maximumLoan + inputs.downPayment + inputs.tradeInValue - inputs.outstandingLoan);

  const isPayment = mode === "payment";

  return (
    <section className="ga-fc">
      <header className="ga-fc-head">
        <h2>Vehicle Finance Calculator</h2>
        <p>Estimate your payments or work out the vehicle budget that fits your pocket.</p>
      </header>

      <nav className="ga-fc-modes" aria-label="Calculator mode">
        <button className={`ga-fc-mode ${isPayment ? "active" : ""}`} onClick={() => setMode("payment")}>Calculate My Payment</button>
        <button className={`ga-fc-mode ${!isPayment ? "active" : ""}`} onClick={() => setMode("budget")}>Calculate My Budget</button>
      </nav>

      <div className="ga-fc-body">
        <div className="ga-fc-inputs">
          <h3 className="ga-fc-title">{isPayment ? "Enter Your Vehicle Details" : "Enter Your Affordable Payment"}</h3>
          <div className="ga-fc-grid">
            {isPayment ? (
              <div className="ga-fc-field full">
                <label htmlFor="fc-price">Vehicle Price</label>
                <div className="ga-fc-range-row">
                  <input id="fc-price-range" type="range" min={0} max={10000000} step={1000} value={Math.min(toNumber(vehiclePrice), 10000000)} onChange={(e) => setVehiclePrice(e.target.value)} />
                  <div className="ga-fc-wrap">
                    <span className="ga-fc-prefix">GH₵</span>
                    <input id="fc-price" className="has-prefix" type="number" min={0} max={10000000} step={1000} value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="ga-fc-field full">
                <label htmlFor="fc-afford">Affordable Payment Amount</label>
                <div className="ga-fc-wrap">
                  <span className="ga-fc-prefix">GH₵</span>
                  <input id="fc-afford" className="has-prefix" type="number" min={0} step={100} value={affordablePayment} onChange={(e) => setAffordablePayment(e.target.value)} />
                </div>
              </div>
            )}

            <div className="ga-fc-field">
              <label htmlFor="fc-trade">Trade-in Value</label>
              <div className="ga-fc-wrap">
                <span className="ga-fc-prefix">GH₵</span>
                <input id="fc-trade" className="has-prefix" type="number" min={0} step={500} value={tradeInValue} onChange={(e) => setTradeInValue(e.target.value)} />
              </div>
            </div>

            <div className="ga-fc-field">
              <label htmlFor="fc-loanbal">Outstanding Loan Balance</label>
              <div className="ga-fc-wrap">
                <span className="ga-fc-prefix">GH₵</span>
                <input id="fc-loanbal" className="has-prefix" type="number" min={0} step={500} value={outstandingLoan} onChange={(e) => setOutstandingLoan(e.target.value)} />
              </div>
            </div>

            <div className="ga-fc-field">
              <label htmlFor="fc-down">Down Payment</label>
              <div className="ga-fc-wrap">
                <span className="ga-fc-prefix">GH₵</span>
                <input id="fc-down" className="has-prefix" type="number" min={0} step={500} value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
              </div>
            </div>

            <div className="ga-fc-field">
              <label htmlFor="fc-rate">Annual Interest Rate</label>
              <div className="ga-fc-wrap">
                <input id="fc-rate" className="has-suffix" type="number" min={0} max={40} step={0.01} value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
                <span className="ga-fc-suffix">%</span>
              </div>
            </div>

            <div className="ga-fc-field">
              <label htmlFor="fc-months">Loan Duration</label>
              <select id="fc-months" value={loanMonths} onChange={(e) => setLoanMonths(e.target.value)}>
                {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>

            {!isPayment && (
              <div className="ga-fc-field">
                <label htmlFor="fc-budget-freq">Payment Frequency</label>
                <select id="fc-budget-freq" value={budgetFrequency} onChange={(e) => setBudgetFrequency(e.target.value as Frequency)}>
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
          </div>

          {!valid && <div className="ga-fc-error" role="alert">{errors.join(" ")}</div>}
        </div>

        <aside className="ga-fc-results">
          <h3 className="ga-fc-title">Estimated Results</h3>

          <div className="ga-fc-summary">
            <div className="ga-fc-summary-label">{isPayment ? "Amount to Finance" : "Estimated Vehicle Budget"}</div>
            <div className="ga-fc-summary-value">{formatCurrency(isPayment ? amountFinanced : maximumVehiclePrice)}</div>
            <div className="ga-fc-summary-sub">
              {isPayment
                ? "Vehicle price plus outstanding loan, less trade-in and down payment."
                : "Estimated maximum vehicle price based on your affordable payment."}
            </div>
          </div>

          {isPayment ? (
            <>
              <div className="ga-fc-freqs">
                {(Object.keys(frequencySettings) as Frequency[]).map((f) => (
                  <button key={f} className={`ga-fc-freq ${paymentFrequency === f ? "active" : ""}`} onClick={() => setPaymentFrequency(f)}>
                    {frequencySettings[f].displayName}
                  </button>
                ))}
              </div>
              <div className="ga-fc-rows">
                <div className="ga-fc-row"><span>{frequencySettings[paymentFrequency].label}</span><strong>{formatCurrency(loanResult.paymentAmount)}</strong></div>
                <div className="ga-fc-row"><span>Number of Payments</span><strong>{loanResult.numberOfPayments.toLocaleString("en-GH")}</strong></div>
                <div className="ga-fc-row"><span>Total Interest</span><strong>{formatCurrency(loanResult.totalInterest)}</strong></div>
                <div className="ga-fc-row"><span>Total Amount Payable</span><strong>{formatCurrency(loanResult.totalPayable)}</strong></div>
              </div>
            </>
          ) : (
            <div className="ga-fc-rows">
              <div className="ga-fc-row"><span>Maximum Loan Amount</span><strong>{formatCurrency(budgetResult.maximumLoan)}</strong></div>
              <div className="ga-fc-row"><span>Estimated Maximum Vehicle Price</span><strong>{formatCurrency(maximumVehiclePrice)}</strong></div>
              <div className="ga-fc-row"><span>Selected Payment Frequency</span><strong>{frequencySettings[budgetFrequency].displayName}</strong></div>
              <div className="ga-fc-row"><span>Total Number of Payments</span><strong>{budgetResult.numberOfPayments.toLocaleString("en-GH")}</strong></div>
            </div>
          )}

          <div className="ga-fc-ctas">
            <button className="ga-fc-cta primary" onClick={() => onApply?.()}>Apply for Financing</button>
            <a className="ga-fc-cta secondary" href="/cars">View Vehicles</a>
            <a className="ga-fc-cta secondary" href="https://wa.me/233592495787" target="_blank" rel="noopener noreferrer">WhatsApp an Advisor</a>
            <button className="ga-fc-cta primary" onClick={() => (onCallBack ?? onApply)?.()}>Request a Call Back</button>
          </div>

          <p className="ga-fc-disclaimer">
            This calculator provides estimates for illustration purposes only. Actual payments, interest rates, fees and financing
            terms may vary based on the vehicle, lender approval, customer credit profile and other financing requirements. This
            calculation is not a financing offer or a guarantee of approval.
          </p>
        </aside>
      </div>
    </section>
  );
}