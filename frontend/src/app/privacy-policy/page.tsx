import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to JaldiBhejo. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

      <h2>2. WebRTC and File Sharing Privacy</h2>
      <p>JaldiBhejo operates using WebRTC technology for peer-to-peer file sharing. <strong>We do not store your files on our servers.</strong> Files are transferred directly between the sender and the receiver. Once the transfer is complete or the browser window is closed, the connection is severed, and no trace of the transferred files remains on our infrastructure. We cannot access, view, or retain the content you share.</p>

      <h2>3. The Data We Collect</h2>
      <p>We may collect, use, store and transfer different kinds of personal data about you, including:</p>
      <ul>
        <li><strong>Technical Data:</strong> Includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
        <li><strong>Usage Data:</strong> Includes information about how you use our website.</li>
      </ul>

      <h2>4. Use of Cookies and Tracking Technologies</h2>
      <p>Our website uses cookies and similar tracking technologies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and allows us to improve our site.</p>
      
      <h2>5. Google AdSense and Third-Party Vendors</h2>
      <p>We use Google AdSense to display advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads on JaldiBhejo. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</p>
      <ul>
        <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
        <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
        <li>Users may opt-out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li>
      </ul>

      <h2>6. Data Security</h2>
      <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>

      <h2>7. Contact Us</h2>
      <p>If you have any questions about this privacy policy or our privacy practices, please contact us at admin@jaldibhejo.com.</p>
    </main>
  );
}
