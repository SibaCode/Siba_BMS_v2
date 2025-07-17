
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Star, 
  Store,
  Package,
  Truck,
  Shield
} from "lucide-react";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const productsCol = collection(db, "products");
      const q = query(productsCol, where("productID", "==", productId));
      const productsSnapshot = await getDocs(q);
      
      if (!productsSnapshot.empty) {
        const productData = {
          id: productsSnapshot.docs[0].id,
          ...productsSnapshot.docs[0].data(),
        };
        setProduct(productData);
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const price = selectedVariant?.sellingPrice || product.price || 0;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: parseInt(product.productID),
        name: product.name,
        price: price,
        category: product.category,
        image: product.productImage || selectedVariant?.images
      });
    }
    
    // Optional: Show success message or redirect
    navigate("/store/cart");
  };

  const updateQuantity = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const images = [
    product?.productImage,
    ...(selectedVariant?.images ? [selectedVariant.images] : []),
    ...(product?.variants?.map((v: any) => v.images).filter(Boolean) || [])
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/store">Back to Store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-semibold">Your Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Store className="h-24 w-24 text-primary/50" />
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) • 124 reviews</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-4">
                R{selectedVariant?.sellingPrice || product.price || 0}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Variant:</label>
                <Select
                  value={selectedVariant?.id}
                  onValueChange={(value) => {
                    const variant = product.variants.find((v: any) => v.id === value);
                    setSelectedVariant(variant);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant: any) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.color} - R{variant.sellingPrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity:</label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.status !== "In stock"}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.status === "In stock" ? `Add ${quantity} to Cart` : "Out of Stock"}
            </Button>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium">Free Delivery</div>
                <div className="text-xs text-muted-foreground">Orders over R500</div>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium">1 Year Warranty</div>
                <div className="text-xs text-muted-foreground">Quality guaranteed</div>
              </div>
              <div className="text-center">
                <Package className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium">Easy Returns</div>
                <div className="text-xs text-muted-foreground">30-day policy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-xl font-semibold">Product Description</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "This premium product is crafted with the highest quality materials and attention to detail. Perfect for everyday use and special occasions alike. Available in multiple colors and variants to suit your personal style and preferences."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
