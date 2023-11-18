export function timePassed(messageSentTime: Date): string {
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - messageSentTime.getTime();

    const secondsPast = Math.floor(timeDifference / 1000);
    const minutesPast = Math.floor(secondsPast / 60);

    const hoursPast = Math.floor(minutesPast / 60);
    const daysPast = Math.floor(hoursPast / 24);

    let timePastString = "";
    if (secondsPast < 60) {
      if (secondsPast == 0) {
        timePastString = `1 second(s) ago`;
      } else {
        timePastString = `${secondsPast} second(s) ago`;
      }
    } else if (minutesPast < 60) {
      timePastString = `${minutesPast} minute(s) ago`;
    } else if (hoursPast < 24) {
      timePastString = `${hoursPast} hour(s) ago`;
    } else {
      timePastString = `${daysPast} day(s) ago`;
    }
    return timePastString;
  }