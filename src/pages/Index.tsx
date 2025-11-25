import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { products, categories, type Product } from '@/data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
                <Icon name="Cpu" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PC Builder</h1>
                <p className="text-xs text-muted-foreground">Собери ПК своей мечты</p>
              </div>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="relative">
                  <Icon name="ShoppingCart" className="mr-2 h-5 w-5" />
                  Корзина
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Icon name="ShoppingCart" className="h-5 w-5" />
                    Корзина
                  </SheetTitle>
                  <SheetDescription>
                    {cartItemsCount > 0
                      ? `У вас ${cartItemsCount} ${cartItemsCount === 1 ? 'товар' : 'товара'} в корзине`
                      : 'Ваша корзина пуста'}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  {cart.map((item) => (
                    <Card key={item.product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.product.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{item.product.brand}</p>
                            <p className="font-bold text-primary mt-2">
                              {item.product.price.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Icon name="Minus" className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Icon name="Plus" className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Icon name="Trash2" className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Итого:</span>
                        <span className="text-primary">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <Button size="lg" className="w-full">
                        <Icon name="CheckCircle" className="mr-2 h-5 w-5" />
                        Оформить заказ
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Собери свой идеальный ПК
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выбирайте из актуальных комплектующих 2024-2025 года. Проверка совместимости,
            детальные характеристики и лучшие цены.
          </p>
        </section>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-white/50 p-2 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">
              <Icon name="Layers" className="mr-2 h-4 w-4" />
              Все товары
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="rounded-lg">
                <Icon name={category.icon as any} className="mr-2 h-4 w-4" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader className="space-y-2">
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-4 transition-transform group-hover:scale-110"
                      />
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {categories.find((c) => c.id === product.category)?.name}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{product.brand}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {product.price.toLocaleString('ru-RU')}
                      </span>
                      <span className="text-sm text-muted-foreground">₽</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openProductDetails(product)}
                      >
                        <Icon name="Info" className="mr-2 h-4 w-4" />
                        Подробнее
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => addToCart(product)}
                      >
                        <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                        В корзину
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-base">{selectedProduct.brand}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full w-full object-contain p-8"
                  />
                </div>

                <div>
                  <h3 className="mb-4 text-xl font-semibold">Характеристики</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedProduct.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium text-muted-foreground">{key}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Цена</p>
                    <p className="text-3xl font-bold text-primary">
                      {selectedProduct.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <Button size="lg" onClick={() => {
                    addToCart(selectedProduct);
                    setIsProductDialogOpen(false);
                  }}>
                    <Icon name="ShoppingCart" className="mr-2 h-5 w-5" />
                    Добавить в корзину
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <footer className="mt-20 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 PC Builder. Конструктор игровых ПК</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
