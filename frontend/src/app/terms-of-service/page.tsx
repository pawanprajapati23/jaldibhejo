import React from 'react';

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 prose prose-invert">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using JaldiBhejo, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

      <h2>2. Description of Service</h2>
      <p>JaldiBhejo provides users with access to a rich collection of resources, including various online tools and peer-to-peer file sharing capabilities utilizing WebRTC technology. You understand and agree that the service is provided "AS-IS" and that JaldiBhejo assumes no responsibility for the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings.</p>

      <h2>3. User Conduct</h2>
      <p>You agree to not use the service to:</p>
      <ul>
        <li>Upload, post, email, transmit, or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
        <li>Harm minors in any way.</li>
        <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
        <li>Interfere with or disrupt the service or servers or networks connected to the service.</li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>All content included on the site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of JaldiBhejo or its content suppliers and protected by international copyright laws.</p>

      <h2>5. Modifications to Service</h2>
      <p>JaldiBhejo reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. You agree that JaldiBhejo shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.</p>

      <h2>6. Governing Law</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
    </main>
  );
}
