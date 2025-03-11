import styles from "../styles/progressBar.module.scss";

interface StrengthValue {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
}

const strength: { [key: number]: string } = {
  1: "słabe",
  2: "średnie",
  3: "mocne",
};

const getPasswordStrength = (
  password: string,
  strengthValue: StrengthValue
): string => {
  strengthValue.upper = /[A-Z]/.test(password);
  strengthValue.lower = /[a-z]/.test(password);
  strengthValue.numbers = /\d/.test(password);

  let strengthIndicator = 0;

  for (const metric in strengthValue) {
    if (strengthValue[metric as keyof StrengthValue]) {
      strengthIndicator++;
    }
  }

  return strength[strengthIndicator] ?? "";
};

const getStrength = (password: string): string => {
  const strengthValue: StrengthValue = {
    upper: false,
    numbers: false,
    lower: false,
  };

  return getPasswordStrength(password, strengthValue);
};

export const handleChange = (
  register: string,
  bars: React.RefObject<HTMLDivElement | null>,
  strengthDiv: React.RefObject<HTMLDivElement | null>
): void => {
  const password = register;

  const strengthText = getStrength(password);

  if (bars && bars.current && strengthDiv.current) {
    bars.current.className = "";

    if (strengthText) {
      strengthDiv.current.innerText = `${strengthText} hasło`;
      if (strengthText in styles) {
        bars.current.classList.add(styles[strengthText]);
      }
    } else {
      strengthDiv.current.innerText = "";
    }
  }
};
