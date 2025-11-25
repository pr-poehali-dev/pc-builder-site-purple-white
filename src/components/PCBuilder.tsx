import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { products, categories, type Product } from '@/data/products';

interface BuildSlot {
  category: string;
  product: Product | null;
}

interface CompatibilityIssue {
  type: 'error' | 'warning';
  message: string;
}

const PCBuilder = () => {
  const [build, setBuild] = useState<BuildSlot[]>(
    categories.map((cat) => ({ category: cat.id, product: null }))
  );
  const [selectingCategory, setSelectingCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getSlot = (category: string) => build.find((s) => s.category === category);
  
  const setProduct = (category: string, product: Product | null) => {
    setBuild((prev) =>
      prev.map((slot) => (slot.category === category ? { ...slot, product } : slot))
    );
  };

  const checkCompatibility = (): CompatibilityIssue[] => {
    const issues: CompatibilityIssue[] = [];
    const cpu = getSlot('cpu')?.product;
    const motherboard = getSlot('motherboard')?.product;
    const ram = getSlot('ram')?.product;
    const gpu = getSlot('gpu')?.product;
    const psu = getSlot('psu')?.product;
    const cooling = getSlot('cooling')?.product;

    if (cpu && motherboard) {
      if (cpu.socket !== motherboard.socket) {
        issues.push({
          type: 'error',
          message: `Несовместимость сокетов: процессор ${cpu.socket}, материнская плата ${motherboard.socket}`,
        });
      }
    }

    if (motherboard && ram) {
      if (motherboard.memoryType !== ram.memoryType) {
        issues.push({
          type: 'error',
          message: `Несовместимость памяти: материнская плата поддерживает ${motherboard.memoryType}, выбрана ${ram.memoryType}`,
        });
      }
    }

    const totalTDP = (cpu?.tdp || 0) + (gpu?.tdp || 0);
    const recommendedPSU = Math.ceil((totalTDP * 1.5) / 50) * 50;

    if (psu && psu.wattage) {
      if (psu.wattage < totalTDP * 1.3) {
        issues.push({
          type: 'error',
          message: `Недостаточная мощность БП: требуется минимум ${recommendedPSU}Вт, выбрано ${psu.wattage}Вт`,
        });
      } else if (psu.wattage < totalTDP * 1.5) {
        issues.push({
          type: 'warning',
          message: `Мощность БП на пределе. Рекомендуем ${recommendedPSU}Вт для запаса`,
        });
      }
    } else if (cpu || gpu) {
      issues.push({
        type: 'warning',
        message: `Рекомендуемая мощность БП: ${recommendedPSU}Вт (текущее потребление: ~${totalTDP}Вт)`,
      });
    }

    if (gpu && psu) {
      const has16pin = psu.psuConnectors?.includes('16-pin');
      const needs16pin = gpu.psuConnectors?.includes('16-pin');
      
      if (needs16pin && !has16pin) {
        issues.push({
          type: 'error',
          message: 'Видеокарта требует 16-pin разъем питания (ATX 3.0), но БП его не имеет',
        });
      }
    }

    if (cpu && cooling && cpu.tdp > (cooling.tdp || 0)) {
      issues.push({
        type: 'warning',
        message: `TDP процессора (${cpu.tdp}Вт) превышает возможности охлаждения (${cooling.tdp}Вт)`,
      });
    }

    if (cpu && !motherboard) {
      issues.push({ type: 'warning', message: 'Выберите материнскую плату для процессора' });
    }

    if (motherboard && !cpu) {
      issues.push({ type: 'warning', message: 'Выберите процессор для материнской платы' });
    }

    if (gpu && !psu) {
      issues.push({ type: 'warning', message: 'Добавьте блок питания для видеокарты' });
    }

    return issues;
  };

  const getTotalPrice = () => {
    return build.reduce((sum, slot) => sum + (slot.product?.price || 0), 0);
  };

  const getAssemblyPrice = () => {
    const total = getTotalPrice();
    return Math.round(total * 0.065);
  };

  const openProductSelector = (category: string) => {
    setSelectingCategory(category);
    setIsDialogOpen(true);
  };

  const selectProduct = (product: Product) => {
    if (selectingCategory) {
      setProduct(selectingCategory, product);
    }
    setIsDialogOpen(false);
  };

  const removeProduct = (category: string) => {
    setProduct(category, null);
  };

  const compatibility = checkCompatibility();
  const errors = compatibility.filter((c) => c.type === 'error');
  const warnings = compatibility.filter((c) => c.type === 'warning');
  const totalPrice = getTotalPrice();
  const assemblyPrice = getAssemblyPrice();

  const availableProducts = selectingCategory
    ? products.filter((p) => p.category === selectingCategory)
    : [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Конструктор ПК</h2>
        <p className="text-muted-foreground">
          Соберите компьютер с автоматической проверкой совместимости
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {categories.map((category) => {
            const slot = getSlot(category.id);
            const product = slot?.product;

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={category.icon as any} className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {product ? product.brand : 'Не выбрано'}
                        </CardDescription>
                      </div>
                    </div>
                    {product ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(category.id)}
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {product ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.entries(product.specs)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                        <p className="font-bold text-primary mt-2">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <Button onClick={() => openProductSelector(category.id)}>
                        Изменить
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openProductSelector(category.id)}
                    >
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Выбрать {category.name.toLowerCase()}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" className="h-5 w-5" />
                Сводка сборки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Проверка совместимости</h4>
                {errors.length === 0 && warnings.length === 0 ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Все компоненты совместимы!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {errors.map((issue, i) => (
                      <Alert key={i} variant="destructive">
                        <Icon name="AlertCircle" className="h-4 w-4" />
                        <AlertDescription className="text-xs">{issue.message}</AlertDescription>
                      </Alert>
                    ))}
                    {warnings.map((issue, i) => (
                      <Alert key={i} className="bg-yellow-50 border-yellow-200">
                        <Icon name="AlertTriangle" className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-xs text-yellow-700">
                          {issue.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Стоимость комплектующих:</span>
                  <span className="font-semibold">
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Профессиональная сборка (6.5%):</span>
                  <span className="font-semibold text-primary">
                    +{assemblyPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого с сборкой:</span>
                  <span className="text-primary">
                    {(totalPrice + assemblyPrice).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="space-y-2">
                  <Button className="w-full" size="lg" disabled={errors.length > 0}>
                    <Icon name="ShoppingCart" className="mr-2 h-5 w-5" />
                    Заказать с сборкой
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Профессиональная сборка включает: установку всех компонентов, подключение
                    кабелей, настройку BIOS, тестирование системы
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Выберите{' '}
              {categories.find((c) => c.id === selectingCategory)?.name.toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              Доступно {availableProducts.length} вариантов
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {availableProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => selectProduct(product)}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">{product.name}</CardTitle>
                      <CardDescription className="text-xs">{product.brand}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    {Object.entries(product.specs)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-primary">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <Button size="sm">Выбрать</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PCBuilder;
