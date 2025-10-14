import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import Logo from '../ui/Logo.jsx';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Partners', path: '/partners' },
        { name: 'Press', path: '/press' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Articles', path: '/articles' },
        { name: 'Locations', path: '/gyms' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Help Center', path: '/support' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Cookie Policy', path: '/cookies' },
        { name: 'Accessibility', path: '/accessibility' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FiInstagram size={20} />, name: 'Instagram', path: 'https://instagram.com' },
    { icon: <FiFacebook size={20} />, name: 'Facebook', path: 'https://facebook.com' },
    { icon: <FiTwitter size={20} />, name: 'Twitter', path: 'https://twitter.com' },
    { icon: <FiYoutube size={20} />, name: 'YouTube', path: 'https://youtube.com' },
  ];

  return (
    <footer className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            <p className="mt-4 text-light-textSecondary dark:text-dark-textSecondary max-w-md">
              FitClub is a premium fitness subscription service connecting you to gyms and fitness centers nationwide. Train anywhere, anytime.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full text-light-textSecondary dark:text-dark-textSecondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-light-background dark:hover:bg-dark-background transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer links */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-base mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-light-textSecondary dark:text-dark-textSecondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-light-border dark:border-dark-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
            © {currentYear} FitClub. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-light-textSecondary dark:text-dark-textSecondary">
            <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-primary-600 dark:hover:text-primary-400">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;