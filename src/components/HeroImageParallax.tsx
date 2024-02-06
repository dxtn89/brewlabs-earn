import Image from "next/image";
import styles from "../styles/parallax.module.scss";

const HeroImageParallax = () => {
  return (
    <div className={styles.parallax}>
      <Image
        alt="Brewlabs token image"
        width={96}
        height={87}
        src="/images/brewlabs-hero-coin-2.png"
        className={`${styles.parallax_coin_2} z-20 ml-52 mt-52 h-auto w-12 sm:ml-[29rem] sm:w-24`}
      />

      <Image
        alt="Brewlabs token image"
        width={96}
        height={87}
        src="/images/brewlabs-hero-coin-1.png"
        className={`${styles.parallax_coin_1} z-20 ml-12 mt-48 h-auto w-12 sm:w-24`}
      />

      <Image
        alt="Brewlabs token image"
        width={96}
        height={87}
        src="/images/brewlabs-hero-coin-2.png"
        className={`${styles.parallax_coin_3} ml-36 mt-12 h-auto w-12 sm:ml-52 sm:mt-[29rem] sm:w-24`}
      />

      <Image
        priority={true}
        width={518}
        height={815}
        src="/images/brewlabs-hero-phone-back.png"
        alt="Brewlabs Swap interface"
        className={`${styles.parallax_phone_back} z-10 ml-2 mt-12 w-auto sm:ml-16 `}
      />

      <Image
        priority={true}
        width={523}
        height={815}
        src="/images/brewlabs-hero-phone-front.png"
        alt="Brewlabs Swap interface"
        className={`${styles.parallax_phone_front} z-10 ml-24 mt-28 w-auto sm:ml-60`}
      />

      <Image
        width={592}
        height={547}
        src="/images/brewlabs-hero-backlight.png"
        alt="Brewlabs hero back light"
        className={`${styles.parallax_bg} mx-auto w-96 sm:w-auto`}
      />
    </div>
  );
};

export default HeroImageParallax;
