import React from 'react';
import HeroImage from "../../assets/HeroImage.jpg"
import HeroImage2 from "../../assets/vegetables-752153_1920-removebg-preview.png"

function ImageSlider(props) {
    return (
        <div className=''>
            <div className=''>
                <img className='w-full' style={{height: "50pc"}} src={HeroImage2} alt="" />
            </div>
        </div>
    );
}

export default ImageSlider;