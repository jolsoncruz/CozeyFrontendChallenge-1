import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  SeatingWrapper,
  AddToCartButton,
  AddToCartContainer,
  ErrorMessage,
  Loader,
} from "./styles";
import axios from "axios";
// NOTE: Removed import statement for Collection as it is not used in the code snippet
import ColorSelector from "../Common/ColorSelector"; //NOTE: Added missing import statement for ColorSelector
import SeatingOptionSelector from "../Common/SeatingOptionSelector"; //NOTE: Created a separate component for SeatingOptionSelector and placed it in the same folder as CodeSelector.tsx.
import { ConfigSelectionData, FetchDataResponse, handleconfig } from "./types";
import { useCartMutation } from "../hooks/useCartMutation";
import { calculateCozeyCarePrice } from "../helpers/calculateCozeyCarePrice";
import React from "react";

// Prop types for SeatingConfigurator component
interface ISeatingConfiguratorProps {
  collectionTitle: string;
  seating: {
    option1OptionsCollection: { value: string }[];
    sofa: { option2OptionsCollection: { value: string }[] };
  }; // NOTE: Added seating prop which consists of option1OptionsCollection and sofa (based on code snippet below)
  config: { priceUsd: number }; // NOTE: Added config prop which consists of priceUsd (based on code snippet below). Could add more props if needed
  price: { currency: string; value: number }; // NOTE: Added price prop which consists of currency and value
  colorsData: { value: string; title: string }[]; // NOTE: Added colorsData prop which consists of value and title (based on ColorSelector.tsx)
  configId: string;
}

export const SeatingConfigurator = ({
  collectionTitle, // Luna, Ciello, etc.
  seating,
  config,
  price,
  colorsData,
  configId,
}: ISeatingConfiguratorProps) => {
  const router = useRouter();

  // NOTE: removed isPopupOpen and counter as they are not used in the code snippet
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [configSelected, setConfigSelected] = useState<ConfigSelectionData>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { addToCart } = useCartMutation();

  const [additionalConfig, setAdditionalConfig] =
    useState<FetchDataResponse | null>(null);

  // useEffect to fetch additional configuration data
  useEffect(() => {
    const fetchAdditionalConfig = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<FetchDataResponse>(
          `/api/configuration/${configId}` // NOTE: Added backticks to wrap the string
        );
        setAdditionalConfig(response.data);
      } catch (error) {
        console.error("Fetch error:", error); // NOTE: Added console.error to log the error
        setErrorMessage("Failed to fetch additional configuration data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdditionalConfig();
  }, [configId]); // NOTE: Modified this useEffect to only run when configId changes

  // useEffect to set default configuration
  useEffect(() => {
    if (seating) {
      setConfigSelected({
        color: seating.option1OptionsCollection[0]?.value,
        seating: seating.sofa.option2OptionsCollection[0]?.value,
      });
    }
  }, [seating]);

  // callback function to handle configuration changes
  const handleConfig = ({ color, seating }: handleconfig) => {
    setConfigSelected((prev) => ({
      // NOTE: Replaced oldSelected to prev for better readability
      ...prev,
      color: color || prev.color,
      seating: seating || prev.seating,
    }));
  };

  // useMemo to calculate total price including Cozey Care
  const totalPrice = useMemo(() => {
    return price.value + calculateCozeyCarePrice(config.priceUsd);
  }, [price, config]);

  // callback function to handle adding item to cart
  const handleAddToCart = async () => {
    // NOTE: Modified if condition to check for both color and seating
    if (!configSelected.color && !configSelected.seating) {
      setErrorMessage("Please select both a color and a seating option");
      return;
    }

    setIsAddingToCart(true); // NOTE: Set isAddingToCart to true if the above condition is met
    setErrorMessage(null);

    // NOTE: Added try-catch block to handle errors
    try {
      await addToCart({
        quantity: 1,
        variantId: configId,
        options: {
          color: configSelected.color,
          seating: configSelected.seating,
        },
      });
      router.push("/cart");
    } catch (error) {
      setErrorMessage("Failed to add item to cart");
      console.error("Add to cart error:", error); // NOTE: Added console.error to log the error
    } finally {
      setIsAddingToCart(false);
    }
  };

  // NOTE: Created a separate component for SeatingOptionSelector and placed it in the same folder as CodeSelector.tsx.
  return (
    <SeatingWrapper>
      {/* NOTE: Added conditional rendering for collectionTitle */}
      {collectionTitle && <h1>{collectionTitle}</h1>}

      {isLoading ? (
        <Loader>Loading configurations...</Loader>
      ) : additionalConfig ? (
        <>
          {/* Color Selector */}
          <ColorSelector
            selectedColor={configSelected.color || ""}
            setColor={(color) => handleConfig({ color: color.value })}
            colors={colorsData}
          />

          {/* Seating Option Selector */}
          <SeatingOptionSelector
            selectedSeatingOption={configSelected.seating || ""}
            setSeatingOption={(seatingOption) =>
              handleConfig({ seating: seatingOption.value })
            }
            seatingOptions={additionalConfig.seatingOptions}
          />

          {/* Error Message Handling */}
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

          {/* Add to Cart Button */}
          <AddToCartContainer>
            <AddToCartButton
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart} // NOTE: Disabled button if isAddingToCart is true
            >
              {isAddingToCart
                ? "Adding to Cart..."
                : `Add to Cart - $${totalPrice}`}
            </AddToCartButton>
          </AddToCartContainer>
        </>
      ) : (
        <ErrorMessage>
          {errorMessage || "No configuration data available"}
        </ErrorMessage>
      )}
    </SeatingWrapper>
  );
};
