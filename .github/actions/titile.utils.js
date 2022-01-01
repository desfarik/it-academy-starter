const USER_NAMES = [
  'd.astreyko',
]

export function isValidUserName(name) {
  return USER_NAMES.includes(name.toLowerCase());
}

export function isValidTitle(title) {
  return /$(homework|lesson)[_ ]\d+/ig.test(title)
}

