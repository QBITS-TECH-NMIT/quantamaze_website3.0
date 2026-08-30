import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'src', 'lib', 'teamMembers.js');

const FACULTY_DATA = [];

const LEADERSHIP_DATA = [
  {
    name: 'ML Shikhar',
    role: 'President',
    photo: null,
    photoUrl: null,
    code: 'LE-01',
    isTopLeadership: true,
  },
  {
    name: 'Shreya Rotti',
    role: 'Vice President',
    photo: null,
    photoUrl: null,
    code: 'LE-02',
    isTopLeadership: true,
  },
];

const DOMAINS_DATA = [
  {
    id: 'technical',
    index: '01',
    name: 'Technical',
    tagline: 'Architecture, Systems & Quantum Computing',
    members: [
      { name: 'Syed Maaz', role: 'Head', photo: null, photoUrl: null, code: 'TC-01', isHead: true },
      { name: 'Janvika Malapati', role: 'Member', photo: null, photoUrl: null, code: 'TC-02' },
      { name: 'Prisha Ruturaj C', role: 'Member', photo: null, photoUrl: null, code: 'TC-03' },
      { name: 'Vemala Prajwal', role: 'Member', photo: null, photoUrl: null, code: 'TC-04' },
      { name: 'Haripriya Katabathina', role: 'Member', photo: null, photoUrl: null, code: 'TC-05' },
      { name: 'Hiranmayi', role: 'Member', photo: null, photoUrl: null, code: 'TC-06' },
      { name: 'Pranav Rohan', role: 'Member', photo: null, photoUrl: null, code: 'TC-07' },
      { name: 'Farhan Akhtar', role: 'Member', photo: null, photoUrl: null, code: 'TC-08' },
      { name: 'Jadyn', role: 'Member', photo: null, photoUrl: null, code: 'TC-09' },
      { name: 'Arnav Raj Karn', role: 'Member', photo: null, photoUrl: null, code: 'TC-10' },
    ],
  },
  {
    id: 'administration',
    index: '02',
    name: 'Administration',
    tagline: 'Governance, Strategy & Internal Operations',
    members: [
      { name: 'Haseena Tawfeeqa', role: 'Head', photo: null, photoUrl: null, code: 'AD-01', isHead: true },
      { name: 'Rifa Anjum', role: 'Member', photo: null, photoUrl: null, code: 'AD-02' },
      { name: 'LD Sai Charan', role: 'Member', photo: null, photoUrl: null, code: 'AD-03' },
      { name: 'Abhianv Deo', role: 'Member', photo: null, photoUrl: null, code: 'AD-04' },
      { name: 'Karthik S Rao', role: 'Member', photo: null, photoUrl: null, code: 'AD-05' },
      { name: 'Keerthana Bhat', role: 'Member', photo: null, photoUrl: null, code: 'AD-06' },
      { name: 'D Ganesh', role: 'Member', photo: null, photoUrl: null, code: 'AD-07' },
      { name: 'Raksha P', role: 'Member', photo: null, photoUrl: null, code: 'AD-08' },
    ],
  },
  {
    id: 'design',
    index: '03',
    name: 'Design',
    tagline: 'Visual Identity, UI/UX & Creative Media',
    members: [
      { name: 'Maaz', role: 'Head', photo: null, photoUrl: null, code: 'DS-01', isHead: true },
      { name: 'Vaibhavi', role: 'Head', photo: null, photoUrl: null, code: 'DS-02', isHead: true },
      { name: 'Melisha Dsouza', role: 'Member', photo: null, photoUrl: null, code: 'DS-03' },
      { name: 'Anupriya Kumari', role: 'Member', photo: null, photoUrl: null, code: 'DS-04' },
      { name: 'Swasti Jain', role: 'Member', photo: null, photoUrl: null, code: 'DS-05' },
      { name: 'Shanmukhi Vytlaa', role: 'Member', photo: null, photoUrl: null, code: 'DS-06' },
      { name: 'Dheshna M', role: 'Member', photo: null, photoUrl: null, code: 'DS-07' },
      { name: 'Adhya', role: 'Member', photo: null, photoUrl: null, code: 'DS-08' },
      { name: 'Kulsum', role: 'Member', photo: null, photoUrl: null, code: 'DS-09' },
      { name: 'Arpita Thakur', role: 'Member', photo: null, photoUrl: null, code: 'DS-10' },
    ],
  },
  {
    id: 'events',
    index: '04',
    name: 'Events',
    tagline: 'Hackathon Execution, Logistics & Stage Management',
    members: [
      { name: 'Akshata Choudi', role: 'Head', photo: null, photoUrl: null, code: 'EV-01', isHead: true },
      { name: 'Soham N Jain', role: 'Member', photo: null, photoUrl: null, code: 'EV-02' },
      { name: 'Shreyas S Patil', role: 'Member', photo: null, photoUrl: null, code: 'EV-03' },
      { name: 'Keerthana', role: 'Member', photo: null, photoUrl: null, code: 'EV-04' },
      { name: 'Anya Miryam Camoens', role: 'Member', photo: null, photoUrl: null, code: 'EV-05' },
      { name: 'M Hemanth Reddy', role: 'Member', photo: null, photoUrl: null, code: 'EV-06' },
      { name: 'V Jayanth', role: 'Member', photo: null, photoUrl: null, code: 'EV-07' },
      { name: 'Raksha Jagadeesha', role: 'Member', photo: null, photoUrl: null, code: 'EV-08' },
    ],
  },
  {
    id: 'hospitality',
    index: '05',
    name: 'Hospitality',
    tagline: 'Guest Relations, Accommodations & VIP Care',
    members: [
      { name: 'Deepthi M', role: 'Head', photo: null, photoUrl: null, code: 'HS-01', isHead: true },
      { name: 'Akshay', role: 'Member', photo: null, photoUrl: null, code: 'HS-02' },
      { name: 'Harshith D Raj', role: 'Member', photo: null, photoUrl: null, code: 'HS-03' },
    ],
  },
  {
    id: 'marketing-and-sponsorship',
    index: '06',
    name: 'Marketing And Sponsorship',
    tagline: 'Corporate Partnerships, Outreach & Brand Growth',
    members: [
      { name: 'Kotresh', role: 'Head', photo: null, photoUrl: null, code: 'MK-01', isHead: true },
      { name: 'Rishiman Dadwal', role: 'Member', photo: null, photoUrl: null, code: 'MK-02' },
      { name: 'T Lokeshwar Reddy', role: 'Member', photo: null, photoUrl: null, code: 'MK-03' },
      { name: 'Varsha Sanjay', role: 'Member', photo: null, photoUrl: null, code: 'MK-04' },
      { name: 'Baibhav Kumar', role: 'Member', photo: null, photoUrl: null, code: 'MK-05' },
      { name: 'Ankit', role: 'Member', photo: null, photoUrl: null, code: 'MK-06' },
      { name: 'Veeksha Reddy', role: 'Member', photo: null, photoUrl: null, code: 'MK-07' },
      { name: 'Zainaba', role: 'Member', photo: null, photoUrl: null, code: 'MK-08' },
    ],
  },
  {
    id: 'operations',
    index: '07',
    name: 'Operations',
    tagline: 'Resource Planning, Security & Venue Setup',
    members: [
      { name: 'Vaibhavi L', role: 'Head', photo: null, photoUrl: null, code: 'OP-01', isHead: true },
      { name: 'Dhruvisha', role: 'Member', photo: null, photoUrl: null, code: 'OP-02' },
      { name: 'Sanjana N', role: 'Member', photo: null, photoUrl: null, code: 'OP-03' },
      { name: 'Sri Charan', role: 'Member', photo: null, photoUrl: null, code: 'OP-04' },
      { name: 'Mohammed Sohail Hussain', role: 'Member', photo: null, photoUrl: null, code: 'OP-05' },
      { name: 'Manas Reddy', role: 'Member', photo: null, photoUrl: null, code: 'OP-06' },
      { name: 'Aditi', role: 'Member', photo: null, photoUrl: null, code: 'OP-07' },
      { name: 'Ritik Kumar Tiwary', role: 'Member', photo: null, photoUrl: null, code: 'OP-08' },
    ],
  },
  {
    id: 'rnd',
    index: '08',
    name: 'R&D',
    tagline: 'Quantum Research, Whitepapers & Experimental Circuits',
    members: [
      { name: 'Hari Narayan', role: 'Head', photo: null, photoUrl: null, code: 'RD-01', isHead: true },
      { name: 'Dhruvajyoti Malik', role: 'Member', photo: null, photoUrl: null, code: 'RD-02' },
      { name: 'Samarth Harapanahalli', role: 'Member', photo: null, photoUrl: null, code: 'RD-03' },
      { name: 'Hana Fathima Ameen', role: 'Member', photo: null, photoUrl: null, code: 'RD-04' },
      { name: 'Neha', role: 'Member', photo: null, photoUrl: null, code: 'RD-05' },
      { name: 'Sharanya', role: 'Member', photo: null, photoUrl: null, code: 'RD-06' },
      { name: 'Nanditha', role: 'Member', photo: null, photoUrl: null, code: 'RD-07' },
      { name: 'A S Harish', role: 'Member', photo: null, photoUrl: null, code: 'RD-08' },
      { name: 'Shreeya Attri', role: 'Member', photo: null, photoUrl: null, code: 'RD-09' },
    ],
  },
  {
    id: 'social-media',
    index: '09',
    name: 'Social Media',
    tagline: 'Digital Campaigns, Content Creation & Community',
    members: [
      { name: 'Harshitha S', role: 'Head', photo: null, photoUrl: null, code: 'SM-01', isHead: true },
      { name: 'Lingala Hasini Reddy', role: 'Member', photo: null, photoUrl: null, code: 'SM-02' },
      { name: 'Haniel K Joseph', role: 'Member', photo: null, photoUrl: null, code: 'SM-03' },
      { name: 'Varun Sharma', role: 'Member', photo: null, photoUrl: null, code: 'SM-04' },
      { name: 'Tejas S Reddy', role: 'Member', photo: null, photoUrl: null, code: 'SM-05' },
      { name: 'Mradul', role: 'Member', photo: null, photoUrl: null, code: 'SM-06' },
      { name: 'Varsha R', role: 'Member', photo: null, photoUrl: null, code: 'SM-07' },
      { name: 'Gayatri', role: 'Member', photo: null, photoUrl: null, code: 'SM-08' },
    ],
  },
];

const output = `// This file is generated by scripts/generate-team-members.mjs. Do not edit manually.
export const FACULTY_DATA = ${JSON.stringify(FACULTY_DATA, null, 2)};

export const LEADERSHIP_DATA = ${JSON.stringify(LEADERSHIP_DATA, null, 2)};

export const DOMAINS_DATA = ${JSON.stringify(DOMAINS_DATA, null, 2)};
`;

fs.writeFileSync(outputFile, output, 'utf8');
console.log('Official team roster generated successfully.');
