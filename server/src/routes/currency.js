import express from 'express';
import { parseStringPromise } from 'xml2js';

const router = express.Router();

router.get('/rates', async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const tcmbUrl = `https://www.tcmb.gov.tr/kurlar/${year}${month}/${dateStr}.xml`;

    const response = await fetch(tcmbUrl);
    
    if (!response.ok) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yYear = yesterday.getFullYear();
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
      const yDay = String(yesterday.getDate()).padStart(2, '0');
      const yDateStr = `${yYear}${yMonth}${yDay}`;
      const yesterdayUrl = `https://www.tcmb.gov.tr/kurlar/${yYear}${yMonth}/${yDateStr}.xml`;
      
      const retryResponse = await fetch(yesterdayUrl);
      if (!retryResponse.ok) {
        throw new Error('TCMB verisi alınamadı');
      }
      const xmlData = await retryResponse.text();
      const result = await parseStringPromise(xmlData);
      return res.json(parseTCMBData(result, yDateStr));
    }

    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData);
    
    res.json(parseTCMBData(result, dateStr));
  } catch (err) {
    console.error('TCMB API error:', err);
    res.status(500).json({ 
      message: 'Döviz kurları alınamadı.',
      error: err.message 
    });
  }
});

function parseTCMBData(data, dateStr) {
  const currencies = data.Tarih_Date.Currency;
  
  const usd = currencies.find(c => c.$.CurrencyCode === 'USD');
  const eur = currencies.find(c => c.$.CurrencyCode === 'EUR');
  
  return {
    date: dateStr,
    rates: {
      USD: {
        buying: parseFloat(usd.ForexBuying[0]),
        selling: parseFloat(usd.ForexSelling[0]),
        code: 'USD',
        name: 'Amerikan Doları'
      },
      EUR: {
        buying: parseFloat(eur.ForexBuying[0]),
        selling: parseFloat(eur.ForexSelling[0]),
        code: 'EUR',
        name: 'Euro'
      }
    }
  };
}

export default router;
