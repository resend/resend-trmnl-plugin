# frozen_string_literal: true

# Run with `bin/trmnlp test` (add `--report report` for a page of every screen it drew).
# Docs: https://github.com/usetrmnl/trmnlp/blob/main/docs/testing.md
RSpec.describe 'Resend' do
  SENT = [62_480, 63_112, 56_390, 54_021, 41_207, 43_150, 62_744, 60_318,
          67_902, 62_215, 59_130, 42_086, 45_512, 68_630, 25_934].freeze

  # A Metrics API response in the shape the polling URL asks for, with sample numbers.
  let(:mocks) do
    {
      'https://api.resend.com/emails/metrics*' => {
        json: {
          object: 'metrics',
          start_date: '2026-10-13T00:00:00.000Z',
          end_date: '2026-10-27T15:00:00.000Z',
          totals: { sent: SENT.sum, delivery_rate: 99.12, bounce_rate: 0.61, complaint_rate: 0.02 },
          data: SENT.each_with_index.map { |sent, i| { period: "2026-10-#{13 + i}", sent: } }
        }
      }
    }
  end

  let(:now) { '2026-10-27T15:00:00Z' }

  it_behaves_like 'a publishable recipe'
end
