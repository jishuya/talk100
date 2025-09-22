import { IoTrophy, IoStar } from 'react-icons/io5';
import { BiBulb, BiChat, BiDetail } from "react-icons/bi";
import { MdOutlineStar } from "react-icons/md";
import { AiFillHeart } from "react-icons/ai";

export const iconMap = {
  BiBulb,
  BiChat,
  BiDetail,
  MdOutlineStar,
  AiFillHeart,
  IoTrophy,
  IoStar
};

export const getIcon = (iconName, className = '') => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }
  return <IconComponent className={className} />;
};