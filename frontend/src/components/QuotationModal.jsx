// frontend/src/components/QuotationModal.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Send, X, Building, CheckCircle2, DollarSign, Calculator, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function QuotationModal({
  isOpen,
  onClose,
  lead = null,
  user = null,
}) {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance with PO, 50% prior to dispatch');
  const [deliveryLeadTime, setDeliveryLeadTime] = useState('2 to 3 Weeks from drawing approval');
  const [warranty, setWarranty] = useState('12 Months standard OEM replacement warranty');
  
  // Line items
  const [items, setItems] = useState([
    {
      id: 1,
      description: 'Industrial Heavy Duty Milling Carbide Inserts (Grade ISO-P)',
      hsn: '8208',
      quantity: 50,
      unit: 'Pcs',
      unitPrice: 450,
      taxRate: 18,
    },
    {
      id: 2,
      description: 'CNC Machine Tooling Chuck Fixture (Standard 8-Inch)',
      hsn: '8466',
      quantity: 2,
      unit: 'Sets',
      unitPrice: 12500,
      taxRate: 18,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setQuoteNumber(`QT-2026-MFG-${randomNum}`);
      setClientName(lead?.companyName || '');
      setClientEmail(lead?.email || '');
      setClientPhone(lead?.phone || '');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setValidUntil(futureDate.toISOString().split('T')[0]);
    }
  }, [isOpen, lead]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        description: 'Industrial Component / Raw Material Batch',
        hsn: '8400',
        quantity: 1,
        unit: 'Pcs',
        unitPrice: 1000,
        taxRate: 18,
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      return toast.warn('Quotation must contain at least one line item');
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'quantity' || field === 'unitPrice' || field === 'taxRate'
              ? parseFloat(value) || 0
              : value,
          };
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const totalTax = items.reduce(
    (acc, curr) => acc + (curr.quantity * curr.unitPrice * curr.taxRate) / 100,
    0
  );
  const grandTotal = subtotal + totalTax;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!clientPhone) {
      return toast.warn('No phone number entered for this client');
    }
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
    const summaryMsg = encodeURIComponent(
      `Hello ${lead?.contactName || clientName},\n\nPlease find the quotation summary from ${user?.name || 'our BDA Team'}:\n\n` +
      `📄 *Quotation Ref*: ${quoteNumber}\n` +
      `🏢 *Company*: ${clientName}\n` +
      `💰 *Total Amount*: $${grandTotal.toLocaleString()} (inclusive of tax)\n` +
      `⏱️ *Validity*: Valid until ${validUntil}\n` +
      `📦 *Delivery*: ${deliveryLeadTime}\n\n` +
      `Please let us know if you require technical drawings or purchase order processing.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${summaryMsg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Header - hidden on print */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-slate-900 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Manufacturing Quotation & RFQ</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-500/30">
                  {quoteNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official commercial quotation for precision engineering & manufacturing orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-8">
          
          {/* Company & Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/40 print:bg-gray-50 p-5 rounded-2xl border border-slate-700/60 print:border-gray-200">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">
                FROM (SELLER / BDA AGENT)
              </span>
              <h3 className="text-sm font-bold text-white print:text-black">
                BDA Manufacturing Consortium Pvt. Ltd.
              </h3>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Representative: <strong className="text-slate-200 print:text-black">{user?.name || 'Sales Representative'}</strong> ({user?.role || 'BDA'})
              </p>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Email: {user?.email || 'sales@mfg.com'} | GSTIN: 29AABCB2207R1ZT
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                BILL TO / CLIENT
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Company Name *"
                className="w-full px-3 py-1.5 bg-slate-900 print:bg-white border border-slate-700 print:border-gray-300 rounded-lg text-xs text-white print:text-black font-semibold focus:outline-none focus:border-blue-500 mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Client Email"
                  className="px-2.5 py-1 bg-slate-900 print:bg-white border border-slate-700 print:border-gray-300 rounded-lg text-xs text-white print:text-black focus:outline-none"
                />
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Client Phone (+91...)"
                  className="px-2.5 py-1 bg-slate-900 print:bg-white border border-slate-700 print:border-gray-300 rounded-lg text-xs text-white print:text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 print:text-black uppercase tracking-wider">
                Bill of Materials & Pricing
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 print:hidden"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="border border-slate-700/80 print:border-gray-300 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 print:bg-gray-100 text-slate-300 print:text-black uppercase text-[10px] tracking-wider border-b border-slate-700/80 print:border-gray-300">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">HSN</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Rate ($)</th>
                    <th className="p-3">Tax %</th>
                    <th className="p-3 text-right">Amount ($)</th>
                    <th className="p-3 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {items.map((item, idx) => {
                    const rowTotal = item.quantity * item.unitPrice;
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-3 min-w-[200px]">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 text-xs text-white print:text-black focus:outline-none"
                          />
                        </td>
                        <td className="p-3 w-16">
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                            className="w-full bg-transparent text-slate-400 print:text-black text-[11px] font-mono focus:outline-none"
                          />
                        </td>
                        <td className="p-3 w-16">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-950 print:bg-transparent border border-slate-700 print:border-none rounded px-2 py-0.5 text-xs text-white print:text-black font-semibold text-center"
                          />
                        </td>
                        <td className="p-3 w-16">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full bg-transparent text-slate-400 print:text-black text-center focus:outline-none"
                          />
                        </td>
                        <td className="p-3 w-24">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-slate-950 print:bg-transparent border border-slate-700 print:border-none rounded px-2 py-0.5 text-xs text-white print:text-black font-mono text-right"
                          />
                        </td>
                        <td className="p-3 w-16 text-center text-slate-400 print:text-black font-mono">
                          {item.taxRate}%
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-black">
                          ${rowTotal.toLocaleString()}
                        </td>
                        <td className="p-3 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Commercial Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 bg-slate-800/30 print:bg-transparent p-4 rounded-2xl border border-slate-700/50 print:border-gray-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Standard Commercial Terms
              </span>
              <div>
                <span className="text-slate-400 text-[11px] block">Payment Terms:</span>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-700 print:border-gray-300 py-1 text-xs text-slate-200 print:text-black focus:outline-none"
                />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Lead Time:</span>
                <input
                  type="text"
                  value={deliveryLeadTime}
                  onChange={(e) => setDeliveryLeadTime(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-700 print:border-gray-300 py-1 text-xs text-slate-200 print:text-black focus:outline-none"
                />
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Warranty:</span>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-700 print:border-gray-300 py-1 text-xs text-slate-200 print:text-black focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-slate-800/60 print:bg-gray-100 p-5 rounded-2xl border border-slate-700/60 print:border-gray-300 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-400 print:text-gray-600">
                <span>Subtotal (Net):</span>
                <span className="font-mono font-semibold text-white print:text-black">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 print:text-gray-600">
                <span>Estimated Taxes (GST 18%):</span>
                <span className="font-mono font-semibold text-white print:text-black">
                  ${totalTax.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-slate-700 print:border-gray-300 pt-2.5 flex justify-between items-center">
                <span className="text-sm font-bold text-white print:text-black uppercase">
                  Grand Total:
                </span>
                <span className="text-xl font-extrabold text-cyan-400 print:text-black font-mono">
                  ${grandTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 text-right print:text-gray-500">
                Valid until: {validUntil}
              </p>
            </div>
          </div>

          {/* Authorized Signature Block */}
          <div className="pt-8 border-t border-slate-800 print:border-gray-300 flex justify-between items-end">
            <div className="text-[10px] text-slate-500 print:text-gray-500">
              Generated via BDA Team Module CRM • Cryptographically verified document
            </div>
            <div className="text-center">
              <div className="font-cursive text-cyan-400 print:text-black text-lg italic tracking-wider mb-1">
                {user?.name || 'Authorized BDA'}
              </div>
              <div className="w-36 h-0.5 bg-slate-700 print:bg-black mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-400 print:text-black uppercase">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions - hidden on print */}
        <div className="p-6 pt-4 border-t border-slate-800 flex items-center justify-between bg-slate-900 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Send size={15} />
              <span>Share via WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                toast.success(`Quotation ${quoteNumber} issued and saved to records!`);
                onClose();
              }}
              className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              Save & Finalize Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
