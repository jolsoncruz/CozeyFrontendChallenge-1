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
import { Collection } from "../Common/Collection"; //NOTE: This can be removed since Collection is not being used (and has no current use).
import ColorSelector from "../Common/ColorSelector"; //NOTE: Added import for ColorSelector (which was missing).
import { ConfigSelectionData, handleconfig, FetchDataResponse } from "./types"; //NOTE: Re-arranged the import declaration to match the exact order in types.ts.
import { useCartMutation } from "../hooks/useCartMutation";
import { calculateCozeyCarePrice } from "../helpers/calculateCozeyCarePrice";
import React from "react";

export const SeatingConfigurator = ({
  collectionTitle,
  seating,
  config,
  price,
  colorsData,
  configId,
}: any) => {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [configSelected, setConfigSelected] = useState<ConfigSelectionData>(
    {} as ConfigSelectionData
  ); //TODO: Review this line of code
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [additionalConfig, setAdditionalConfig] =
    useState<FetchDataResponse | null>(null);

  const { addToCart } = useCartMutation();

  const [counter, setCounter] = useState(0); //NOTE: This can be removed since it is not being used (and has no current use).

  useEffect(() => {
    const fetchAdditionalConfig = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<FetchDataResponse>(
          `/api/configuration/${configId}` //NOTE: added backtick to properly format the string.
        ); //NOTE: Added try-catch for error-handling
        setAdditionalConfig(response.data);
      } catch (err) {
        console.error("Error fetching additional config data:", err);
        setErrorMessage("Failed to load configuration data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdditionalConfig();
  }, []); //NOTE: This runs once at page load

  useEffect(() => {
    if (seating) {
      setConfigSelected({
        color: seating.option1OptionsCollection[0]?.value,
        seating: seating.sofa.option2OptionsCollection[0].value, //NOTE: Remove sofa?
      });
    }
  }, [seating]);

  const handleConfig = ({ color, seating }: ConfigSelectionData) => {
    //NOTE: no use of using handleconfig since it's the same as ConfigSelectionData.
    setConfigSelected((oldSelected) => ({
      ...oldSelected,
      color: color || oldSelected.color,
      seating: seating || oldSelected.seating,
    }));
  };

  const totalPrice = useMemo(() => {
    return price.value + calculateCozeyCarePrice(config.priceUsd);
  }, [price, config]);

  const handleAddToCart = () => {
    if (!configSelected.color || !configSelected.seating) {
      //TODO: Review id this should be OR since the error message says AND.
      setErrorMessage("Please select both a color and a seating option");
      return;
    }
    setErrorMessage(null); //TODO: Review if this should be inside an else clause

    addToCart({
      quantity: 1,
      variantId: configId,
      options: {
        color: configSelected.color,
        seating: configSelected.seating,
      },
    })
      .then(() => {
        router.push("/cart");
      })
      .catch(() => {
        setErrorMessage("Failed to add item to cart");
      });
  };

  return (
    <SeatingWrapper>
      {isLoading ? (
        <Loader>Loading configurations...</Loader>
      ) : additionalConfig ? (
        <>
          <ColorSelector
            selectedColor={configSelected.color || ""} // NOTE: Added || "" to prevent error when color is undefined.
            // selectedColor={configSelected.color}
            setColor={(color) =>
              handleConfig({
                color: color.value,
              })
            }
            colors={colorsData}
          />
          <div>
            <label>Select Seating Option</label>
            <select
              value={configSelected.seating || ""} //NOTE: Remove ?.value since it's not needed.
              onChange={
                (e) => handleConfig({ seating: e.target.value }) //NOTE: Remove object since expected type is string.
              }
            >
              {additionalConfig.seatingOptions.map((option) => (
                <div key={option.value}>
                  <option value={option.value}>{option.title}</option>
                </div>
              ))}
            </select>
          </div>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <AddToCartContainer>
            <AddToCartButton type="button" onClick={handleAddToCart}>
              Add to Cart - ${totalPrice}
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
