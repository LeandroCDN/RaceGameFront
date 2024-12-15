import { useRouter } from "next/router";

const ClaimRewardsButton = ({ playerStat }) => {
  const router = useRouter();

  const handleButtonClick = () => {
    // Case 1: Won the race (unclaimed points)
    if (playerStat && playerStat.unclaimedPoints > 0) {
      router.push(`/result?raceId=${playerStat.lastRaceId}`);
      return;
    }

    // Case 2: Lost the race (played before but no unclaimed points)
    if (
      playerStat &&
      playerStat.unclaimedPoints <= 0 &&
      playerStat.lastRaceId !== 0
    ) {
      router.push(`/result?raceId=${playerStat.lastRaceId}`);
      return;
    }

    // Case 3: Never played a race - button will be disabled
  };

  // Determine button text and state
  const getButtonContent = () => {
    if (playerStat && playerStat.unclaimedPoints > 0) {
      return "CLAIM <br /> REWARDS";
    }

    if (
      playerStat &&
      playerStat.unclaimedPoints <= 0 &&
      playerStat.lastRaceId !== 0
    ) {
      return "VIEW <br /> RESULT";
    }

    return "CLAIM <br /> REWARDS";
  };

  return (
    <button
      onClick={handleButtonClick}
      disabled={playerStat && playerStat.lastRaceId === 0}
      className={`w-[100%] h-auto text-3xl ${
        playerStat && playerStat.unclaimedPoints > 0
          ? "border-green-500 text-2xl text-green-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
          : playerStat && playerStat.lastRaceId !== 0
          ? "text-white" // Normal state for viewed results
          : "opacity-40 cursor-not-allowed"
      }`}
      style={{
        backgroundImage: "url('/buttons/claimgreen.webp')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        height: "84px",
        width: "full",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="text-white leading-[0.9] tracking-tight text-shadow-3"
        dangerouslySetInnerHTML={{ __html: getButtonContent() }}
      />
    </button>
  );
};

export default ClaimRewardsButton;
