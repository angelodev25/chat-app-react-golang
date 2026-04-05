import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export function Logo() {

	return (
		<div className="h-20 flex items-center px-4 border-b gap-2" >
			<LazyLoadImage src="/vite.svg" alt="Logo" width={30} height={30} effect="blur" threshold={100} />
			<h1 className="font-bold text-2xl text-[#1A0340] dark:text-[#a0a0d0]">SpaceTalk</h1>
		</div>
	)
}