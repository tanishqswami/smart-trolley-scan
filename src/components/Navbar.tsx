import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Barcode,
  Menu,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from '@/contexts/CartContext';

const Navbar = () => {
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { path: '/products', label: 'Products', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/scanner', label: 'Scanner', icon: <Barcode className="w-5 h-5" /> }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/products" className="flex items-center font-bold text-xl text-primary mr-10">
          <ShoppingCart className="mr-2 h-6 w-6" />
          <span>SmartTrolley</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Cart Link */}
        <Link to="/cart" className="flex items-center text-sm font-medium transition-colors hover:text-primary">
          <ShoppingCart className="w-5 h-5" />
          <span className="ml-2">Cart</span>
          {totalItems > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {totalItems}
            </span>
          )}
        </Link>

        {/* Mobile Navigation (Hamburger Menu) */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>SmartTrolley Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-6">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center text-sm font-medium py-2 transition-colors hover:text-primary"
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              ))}
              <Link
                to="/cart"
                className="flex items-center text-sm font-medium py-2 transition-colors hover:text-primary"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="ml-2">Cart</span>
                {totalItems > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
