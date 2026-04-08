import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const COMPANY_NAME = 'PT. Harson Multiline Machinery';

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

function buildText(lines) {
  return lines.join('\n');
}

const knowledgeBase = [
  {
    category: 'services',
    keywords: [
      'service',
      'services',
      'what do you do',
      'what services do you offer',
      'what services',
      'offer',
      'offering',
      'company services',
      'our services',
    ],
    response: buildText([
      'PT. Harson Multiline Machinery provides industrial solutions focused on quality, precision, and long-term reliability.',
      '',
      'Main Services:',
      '• Industrial Roller Manufacturing — custom and standard rollers for industrial applications',
      '• Engineering & Design — technical consultation, design support, and solution development',
      '• Maintenance & Repair — preventive maintenance, troubleshooting, and machine repair',
      '• Spare Parts Supply — original and compatible components for fast replacement',
      '• Export & Distribution — safe and efficient delivery support for regional markets',
      '',
      'If you need a quotation or technical consultation, our team can help you identify the right solution.',
    ]),
  },

  {
    category: 'pricing',
    keywords: [
      'price',
      'pricing',
      'cost',
      'costs',
      'quote',
      'quotation',
      'estimate',
      'estimation',
      'tariff',
      'fee',
      'how much',
    ],
    response: buildText([
      'Pricing depends on the product type, specifications, quantity, and delivery requirements.',
      '',
      'How to request a quotation:',
      '• Send your requirements and technical details',
      '• Include dimensions, material preferences, and quantity',
      '• Our team will review the request and prepare a quotation',
      '',
      'Typical quotation outputs include:',
      '• Product specification summary',
      '• Estimated production time',
      '• Unit price and total cost',
      '• Delivery notes and service details',
      '',
      'For the fastest response, provide a clear drawing, sample photo, or technical sheet.',
    ]),
  },

  {
    category: 'hours',
    keywords: [
      'hours',
      'open',
      'opening hours',
      'business hours',
      'operating hours',
      'working hours',
      'schedule',
      'time',
      'when are you open',
    ],
    response: buildText([
      'Business Hours:',
      '• Monday to Friday: 08:00 - 17:00 WIB',
      '• Saturday: 08:00 - 12:00 WIB',
      '• Sunday and public holidays: Closed',
      '',
      'For urgent inquiries outside business hours, please contact the support channel provided by the company.',
    ]),
  },

  {
    category: 'contact',
    keywords: [
      'contact',
      'address',
      'location',
      'office',
      'where are you located',
      'where is your office',
      'head office',
      'workshop',
      'map',
    ],
    response: `
<strong>Our Locations</strong><br><br>

<strong>Head Office — Jakarta</strong><br>
Tempo Scan Tower 32nd Floor,<br>
Jln. HR Rasuna Said, South Jakarta<br>
<a href="https://www.google.com/maps/place/Tempo+Scan+Tower" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>

<br><br>

<strong>Workshop — Cileungsi</strong><br>
Kawasan Kirana Uttama Blok D-23,<br>
Cileungsi, Bogor Regency<br>
<a href="https://www.google.com/maps/place/PT.Harson+Multiline+Machinery" target="_blank" rel="noopener noreferrer">Open Workshop Location</a>
`,
  },

  {
    category: 'technical',
    keywords: [
      'technical',
      'support',
      'help',
      'assistance',
      'troubleshooting',
      'maintenance help',
      'repair help',
      'problem',
      'issue',
      'machine issue',
    ],
    response: `
<strong>Technical Support</strong><br><br>

If you need assistance with machinery, troubleshooting, or maintenance, our technical team is ready to help.

<br><br>

<a href="/contact.html" target="_blank" rel="noopener noreferrer">
Go to Contact Page for Support →
</a>
`,
  },

  {
    category: 'products',
    keywords: [
      'product',
      'products',
      'catalog',
      'catalogue',
      'equipment',
      'item',
      'items',
      'spare part',
      'spare parts',
      'roller',
      'rollers',
    ],
    response: buildText([
      'Main Product Categories:',
      '',
      '• Industrial Rollers — high-precision rollers for manufacturing and processing systems',
      '• Drive Systems — transmission and motion components for industrial equipment',
      '• Custom Parts — made to specification for unique production needs',
      '• Spare Parts — fast replacement components with technical support',
      '',
      'All products are designed with durability, precision, and operational efficiency in mind.',
    ]),
  },

  {
    category: 'company',
    keywords: [
      'about',
      'company',
      'profile',
      'vision',
      'mission',
      'who are you',
      'who is harson',
      'about company',
      'about us',
    ],
    response: buildText([
      `About ${COMPANY_NAME}:`,
      '',
      'We are an industrial machinery company focused on precision manufacturing, technical support, and custom industrial solutions.',
      '',
      'Our priorities:',
      '• High product quality',
      '• Clear communication',
      '• Reliable delivery',
      '• Professional after-sales support',
      '• Practical and efficient solutions for production needs',
    ]),
  },
];

function findResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();

  for (const item of knowledgeBase) {
    for (const keyword of item.keywords) {
      if (message.includes(keyword)) {
        return item.response;
      }
    }
  }

  return buildText([
    'Thank you for your question!',
    '',
    'If you need more specific information, please ask about:',
    '• Our services and products',
    '• Pricing and quotations',
    '• Business hours and contact information',
    '• Technical support',
    '',
    'You can also contact us directly through our website.',
  ]);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty',
        success: false,
      });
    }

    const response = findResponse(message);

    res.json({
      success: true,
      userMessage: message,
      botResponse: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request',
    });
  }
});

app.get('/api/chat', (req, res) => {
  const query = req.query.message;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      error: 'Message query parameter is required',
      success: false,
    });
  }

  const response = findResponse(query);

  res.json({
    success: true,
    userMessage: query,
    botResponse: response,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/categories', (req, res) => {
  const categories = knowledgeBase.map((item) => ({
    category: item.category,
    keywords: item.keywords,
  }));

  res.json({
    success: true,
    categories,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} does not exist`,
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📝 Chatbot API ready at http://localhost:${PORT}/api/chat`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log(`📚 Categories at http://localhost:${PORT}/api/categories`);
});