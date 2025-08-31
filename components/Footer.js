import Link from "next/link";
import styles from "../styles/home.module.css";

export default function footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerWrapper}>
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>MonSavonVert</div>
            <p className={styles.footerAbout}>
              Savons artisanaux, naturels et écologiques fabriqués avec
              passion en Syrie dans l'antique ville d'Alep.
            </p>
            <div className={styles.paymentMethods}>
              <span className={styles.paymentTitle}>
                Moyens de paiement
              </span>
              <div className={styles.paymentIcons}>
                <img src="/images/payments/visa.png" alt="Visa" />
                <img
                  src="/images/payments/mastercard.png"
                  alt="Mastercard"
                />
                <img
                  src="/images/payments/americanexpress.png"
                  alt="American Express"
                />
                <img src="/images/payments/applepay.png" alt="Apple Pay" />
              </div>
            </div>
          </div>

          <div className={styles.footerNavColumns}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Boutique</h3>
              <div className={styles.footerLinks}>
                <Link
                  href="/store"
                  className={styles.footerLink}
                >
                  Notre Collection
                </Link>
                <Link href="/produit/680bd95433437078ee079529" className={styles.footerLink}>
                  Savon d'Alep 5%
                </Link>
                <Link href="/produit/680a5ac9841615e1719b023b" className={styles.footerLink}>
                Savon d'Alep 20%
                </Link>
                <Link
                  href="/produit/67fe455e3de677d3ffa1cf89"
                  className={styles.footerLink}
                >
                Savon d'Alep 35%
                </Link>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Informations</h3>
              <div className={styles.footerLinks}>
                <Link href="/virtues" className={styles.footerLink}>
                  Vertu & bienfaits
                </Link>
                <Link href="/how-to-choose" className={styles.footerLink}>
                  Bien choisir
                </Link>
                <Link href="/info" className={styles.footerLink}>
                  A propos
                </Link>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Contact</h3>
              <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.contactIcon}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <Link href="/contact" className={styles.footerLink}>
                  Formulaire de contact
                </Link>
                </div>
                <div className={styles.contactItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.contactIcon}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+33612345678" className={styles.contactLink}>
                    06 58 00 27 07
                  </a>
                </div>

                <div className={styles.contactItem}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.contactIcon}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a
                    href="mailto:info@monsavonvert.com"
                    className={styles.contactLink}
                  >
                    contact@monsavonvert.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <p className={styles.copyright}>
            © 2025 MonSavonVert. Tous droits réservés.
          </p>
          <div className={styles.footerLegalLinks}>
            <Link href="/terms" className={styles.footerSmallLink}>
              CGV
            </Link>
            <span className={styles.footerDivider}>•</span>
            <Link
              href="/privacy"
              className={styles.footerSmallLink}
            >
              Politique de confidentialité
            </Link>
            <span className={styles.footerDivider}>•</span>
            <Link
              href="/legal"
              className={styles.footerSmallLink}
            >
              Mentions légales
            </Link>
            <span className={styles.footerDivider}>•</span>
            <Link href="/cookies" className={styles.footerSmallLink}>
              Gestion des cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}