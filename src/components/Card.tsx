import { CardElement } from "@/types";

type CardProps = {
    card: CardElement;
    onClick: () => void;
};

export function Card({ card, onClick }: CardProps) {
    return (
        <button className="card" onClick={onClick}>
            {card.title}
        </button>
    );
}