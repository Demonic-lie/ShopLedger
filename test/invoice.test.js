'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

const cases = [
  {
    name: 'CURRENT BEHAVIOUR: order #1001 with 5% and 12% items and no coupon',
    id: 1001,
    coupon: '',
    items: [
      { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 330, qty: 1, gstRate: 5 },
      { id: 2, name: 'Ghee', sku: 'DAI-001', hsn: '0405', price: 280, qty: 1, gstRate: 12 }
    ],
    invoice: {
      subtotal: 610, discount: 0, tax: 50.1, cgst: 25.05, sgst: 25.05, total: 660.1,
      rows: [
        { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 330, gstPercent: 5, line: 330, lineTax: 16.5 },
        { name: 'Ghee', sku: 'DAI-001', hsn: '0405', qty: 1, price: 280, gstPercent: 12, line: 280, lineTax: 33.6 }
      ]
    },
    pricing: { subtotal: 610, discount: 0, tax: 50.1, cgst: 25.05, sgst: 25.05, total: 660.1 }
  },
  {
    name: 'invoice matches checkout for order #1002 with SAVE10',
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 500, qty: 1, gstRate: 5 },
      { id: 2, name: 'Ghee', sku: 'DAI-001', hsn: '0405', price: 200, qty: 1, gstRate: 12 }
    ],
    invoice: {
      subtotal: 700, discount: 70, tax: 44.1, cgst: 22.05, sgst: 22.05, total: 674.1,
      rows: [
        { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 500, gstPercent: 5, line: 500, lineTax: 22.5 },
        { name: 'Ghee', sku: 'DAI-001', hsn: '0405', qty: 1, price: 200, gstPercent: 12, line: 200, lineTax: 21.6 }
      ]
    },
    pricing: { subtotal: 700, discount: 70, tax: 44.1, cgst: 22.05, sgst: 22.05, total: 674.1 }
  },
  {
    name: 'invoice matches checkout for order #1004 with SAVE10 and the ₹150 cap',
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 1400, qty: 1, gstRate: 5 },
      { id: 2, name: 'Ghee', sku: 'DAI-001', hsn: '0405', price: 840, qty: 1, gstRate: 12 }
    ],
    invoice: {
      subtotal: 2240, discount: 150, tax: 159.36, cgst: 79.68, sgst: 79.68, total: 2249.36,
      rows: [
        { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 1400, gstPercent: 5, line: 1400, lineTax: 65.31 },
        { name: 'Ghee', sku: 'DAI-001', hsn: '0405', qty: 1, price: 840, gstPercent: 12, line: 840, lineTax: 94.05 }
      ]
    },
    pricing: { subtotal: 2240, discount: 150, tax: 159.36, cgst: 79.68, sgst: 79.68, total: 2249.36 }
  },
  {
    name: 'CURRENT BEHAVIOUR: order #1008 with all 18% items and no coupon',
    id: 1008,
    coupon: '',
    items: [
      { id: 1, name: 'Packaged Tea', sku: 'BEV-001', hsn: '0902', price: 1000, qty: 1, gstRate: 18 }
    ],
    invoice: {
      subtotal: 1000, discount: 0, tax: 180, cgst: 90, sgst: 90, total: 1180,
      rows: [
        { name: 'Packaged Tea', sku: 'BEV-001', hsn: '0902', qty: 1, price: 1000, gstPercent: 18, line: 1000, lineTax: 180 }
      ]
    },
    pricing: { subtotal: 1000, discount: 0, tax: 180, cgst: 90, sgst: 90, total: 1180 }
  }
];

for (const example of cases) {
  test(example.name, () => {
    const order = { id: example.id, coupon: example.coupon, items: example.items };
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutFigures = pricing.computeTotals(example.items, example.coupon);

    assert.deepEqual(invoiceFigures, example.invoice);
    assert.deepEqual({
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      cgst: checkoutFigures.cgst,
      sgst: checkoutFigures.sgst,
      total: checkoutFigures.total
    }, example.pricing);
  });
}



test('invoice matches checkout HSN tax and the capped SAVE10 discount', () => {
  const items = [
    { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 1400, qty: 1 },
    { id: 2, name: 'Ghee', sku: 'DAI-001', hsn: '0405', price: 840, qty: 1 }
  ];
  const invoiceFigures = invoice.computeInvoiceFigures({ id: 1004, coupon: 'SAVE10', items });
  const checkoutFigures = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total
  }, {
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total
  });
  assert.deepEqual(invoiceFigures.rows.map((row) => ({ gstPercent: row.gstPercent, lineTax: row.lineTax })),
    checkoutFigures.lines.map((line) => ({ gstPercent: line.gstPercent, lineTax: line.tax })));
});
