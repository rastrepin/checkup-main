-- TURKEY-MIGRATION v0.6, розділ 2: схема. Наявні рядки отримують UAH, на сайті нічого не змінюється.
ALTER TABLE checkup_programs ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'UAH';
ALTER TABLE checkup_programs ADD COLUMN IF NOT EXISTS details jsonb NULL;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkup_programs_currency_check') THEN
    ALTER TABLE checkup_programs ADD CONSTRAINT checkup_programs_currency_check CHECK (currency IN ('UAH', 'USD', 'EUR'));
  END IF;
END $$;
COMMENT ON COLUMN checkup_programs.currency IS 'Валюта ціни: UAH (за замовчуванням), USD, EUR.';
COMMENT ON COLUMN checkup_programs.details IS 'Картка програми: summary, duration, description[], goals[], preparation[]. Склад за напрямками – у composition.';
