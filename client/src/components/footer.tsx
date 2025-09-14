import { Link } from "wouter";
import logoImage from "@assets/generated_images/BrokenVZN_API_logo_design_700a4557.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logoImage} 
                alt="BrokenVZN API Logo" 
                className="h-8 w-8 rounded-lg"
                data-testid="img-logo-footer"
              />
              <span className="text-lg font-bold text-foreground">BrokenVZN API</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Powerful REST API services for modern developers. Built with reliability and performance in mind.
            </p>
            <div className="flex space-x-3">
              <a href="https://github.com/brokenvzn" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-github">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://twitter.com/brokenvzn" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://discord.gg/brokenvzn" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-discord">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">API</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-documentation">Documentation</Link></li>
              <li><a href="#endpoints" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-endpoints">Endpoints</a></li>
              <li><Link href="/docs#rate-limits" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-rate-limits">Rate Limits</Link></li>
              <li><a href="https://status.brokenvzn.com" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-status">Status Page</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@brokenvzn.com" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-help">Help Center</a></li>
              <li><a href="mailto:contact@brokenvzn.com" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">Contact Us</a></li>
              <li><a href="https://discord.gg/brokenvzn" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-community">Community</a></li>
              <li><a href="https://github.com/brokenvzn/api/issues" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-bugs">Bug Reports</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://brokenvzn.com/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">About</a></li>
              <li><a href="https://brokenvzn.com/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
              <li><a href="https://brokenvzn.com/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">Terms of Service</a></li>
              <li><a href="https://github.com/brokenvzn/api/releases" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-changelog">Changelog</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 BrokenVZN API. All rights reserved. • Built with ❤️ for developers
          </p>
        </div>
      </div>
    </footer>
  );
}
