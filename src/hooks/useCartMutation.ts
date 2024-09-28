export const useCartMutation = () => {
  const addToCart = async ({ quantity, variantId, options }: any) => {
    return new Promise<void>((resolve, reject) => {
      console.log("Item added to cart:", { quantity, variantId, options });
      resolve();
    });
  };
  return { addToCart };
};
