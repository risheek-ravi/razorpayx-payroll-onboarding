import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LoadWallet'>;

export const LoadWalletScreen = ({navigation}: Props) => {
  const accountDetails = {
    beneficiaryName: 'Razorpay Software Private Limited',
    bankName: 'HDFC Bank',
    accountNumber: '765432109876543',
    ifsc: 'HDFC0000123',
    accountType: 'Current Account',
    bankAddress: 'HDFC Bank, Lower Parel, Mumbai, Maharashtra',
  };

  const sourceAccounts = [
    {accountNumber: '12345678901234', beneficiary: 'Amit Sharma'},
  ];

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Load Wallet</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>₹ 2,500.00</Text>
        </View>

        {/* Transfer Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏦</Text>
            <Text style={styles.sectionTitle}>Transfer to this account</Text>
          </View>
          <Text style={styles.sectionDescription}>
            To transfer money, please wire it to the following account via a
            validated source account (listed below).
          </Text>

          <View style={styles.detailsCard}>
            <DetailRow
              label="Beneficiary"
              value={accountDetails.beneficiaryName}
              onCopy={() =>
                copyToClipboard(accountDetails.beneficiaryName, 'Beneficiary')
              }
            />
            <DetailRow label="Bank Name" value={accountDetails.bankName} />
            <DetailRow
              label="Account Number"
              value={accountDetails.accountNumber}
              onCopy={() =>
                copyToClipboard(
                  accountDetails.accountNumber,
                  'Account Number',
                )
              }
              highlight
            />
            <DetailRow
              label="IFSC Code"
              value={accountDetails.ifsc}
              onCopy={() => copyToClipboard(accountDetails.ifsc, 'IFSC Code')}
              highlight
            />
            <DetailRow
              label="Account Type"
              value={accountDetails.accountType}
            />
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Bank Address</Text>
                <Text style={styles.detailValue}>
                  {accountDetails.bankAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Important Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Please initiate the transfer from your company bank account.
                Transfers are usually completed within 24 hours.
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Note:</Text> We are dependent on
                the banking system to receive funds. If funds haven't reflected
                after 24 hours, please email{' '}
                <Text style={styles.infoLink}>xpayroll@razorpay.com</Text>.
              </Text>
              <Text style={styles.infoTextItalic}>
                NEFT and RTGS transfers might not work on bank holidays.
              </Text>
            </View>
          </View>
        </View>

        {/* Validated Source Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Validated Source Accounts</Text>
          <Text style={styles.sectionDescription}>
            These are the validated and whitelisted accounts from which you can
            transfer funds to RazorpayX Payroll.
          </Text>

          {sourceAccounts.map((acc, idx) => (
            <View key={idx} style={styles.sourceAccountCard}>
              <View style={styles.sourceAccountContent}>
                <Text style={styles.sourceAccountLabel}>Account Number</Text>
                <Text style={styles.sourceAccountNumber}>
                  {acc.accountNumber}
                </Text>
                <Text style={styles.sourceAccountBeneficiary}>
                  Beneficiary: {acc.beneficiary}
                </Text>
              </View>
              <View style={styles.sourceAccountIcon}>
                <Text style={styles.sourceAccountIconText}>💼</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
  highlight?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  onCopy,
  highlight,
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>
        {value}
      </Text>
    </View>
    {onCopy && (
      <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
        <Text style={styles.copyButtonText}>📋</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailContent: {
    flex: 1,
    paddingRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  detailValueHighlight: {
    color: '#1D4ED8',
  },
  copyButton: {
    padding: 8,
  },
  copyButtonText: {
    fontSize: 18,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoHeader: {
    flexDirection: 'row',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoBold: {
    fontWeight: '700',
  },
  infoLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  infoTextItalic: {
    fontSize: 12,
    color: '#1E3A8A',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  sourceAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  sourceAccountContent: {
    flex: 1,
  },
  sourceAccountLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sourceAccountNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  sourceAccountBeneficiary: {
    fontSize: 12,
    color: '#6B7280',
  },
  sourceAccountIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceAccountIconText: {
    fontSize: 16,
  },
});

