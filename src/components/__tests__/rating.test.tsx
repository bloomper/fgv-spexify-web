import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RatingInput, RatingStars} from "@/components/rating.client";

describe("RatingInput", () => {
    it("rates by click, removes the rating when the same star is chosen again, and moves with the arrow keys", async () => {
        const onChange = vi.fn();
        const {rerender} = render(<RatingInput value={0} onChange={onChange} label="Betyg"/>);

        await userEvent.click(screen.getByRole("radio", {name: /"count":3/}));
        expect(onChange).toHaveBeenLastCalledWith(3);

        rerender(<RatingInput value={3} onChange={onChange} label="Betyg"/>);
        expect(screen.getByRole("radio", {name: /"count":3/})).toHaveAttribute("aria-checked", "true");
        await userEvent.click(screen.getByRole("radio", {name: /"count":3/}));
        expect(onChange).toHaveBeenLastCalledWith(0);

        screen.getByRole("radio", {name: /"count":3/}).focus();
        await userEvent.keyboard("{ArrowRight}");
        expect(onChange).toHaveBeenLastCalledWith(4);
        await userEvent.keyboard("{ArrowLeft}");
        expect(onChange).toHaveBeenLastCalledWith(2);
    });

    it("shows nothing for no rating", () => {
        const {container} = render(<RatingStars value={0}/>);

        expect(container).toBeEmptyDOMElement();
        render(<RatingStars value={2}/>);
        expect(screen.getByRole("img", {name: /rated:.*"count":2/})).toBeInTheDocument();
    });
});
