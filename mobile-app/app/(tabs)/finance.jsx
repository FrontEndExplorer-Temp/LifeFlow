import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Animated } from 'react-native';
import useThemeStore from '../../store/themeStore';
import useFinanceStore from '../../store/financeStore';
import AIFinanceCard from '../../components/AI/AIFinanceCard';

const CATEGORIES = {
    Expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'],
    Income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
};

const TransactionSkeleton = () => {
    const { isDarkMode } = useThemeStore();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: '#ccc', width: '50%', height: 16, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ backgroundColor: '#ccc', width: '30%', height: 12, borderRadius: 4 }} />
            </View>
            <View style={{ backgroundColor: '#ccc', width: 60, height: 20, borderRadius: 4 }} />
        </Animated.View>
    );
};

export default function FinanceScreen() {
    const {
        transactions,
        budgets,
        monthlyStats,
        fetchTransactions,
        fetchBudgets,
        addTransaction,
        deleteTransaction,
        setBudget,
        deleteBudget,
        fetchMonthlyStats,
        isLoading
    } = useFinanceStore();
    const { theme, isDarkMode } = useThemeStore();

    const [activeTab, setActiveTab] = useState('transactions');
    const [modalVisible, setModalVisible] = useState(false);
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Expense',
        category: 'Food',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'Cash'
    });

    const [budgetFormData, setBudgetFormData] = useState({
        category: 'Food',
        monthlyLimit: '',
        month: new Date().toISOString().substring(0, 7)
    });

    const currentMonth = new Date().toISOString().substring(0, 7);

    useEffect(() => {
        fetchTransactions();
        fetchMonthlyStats(currentMonth);
        fetchBudgets(currentMonth);
    }, []);

    const handleSaveTransaction = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) return;

        const transactionData = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editingTransaction) {
            await useFinanceStore.getState().updateTransaction(editingTransaction._id, transactionData);
            fetchMonthlyStats(currentMonth);
            setEditingTransaction(null);
        } else {
            await addTransaction(transactionData);
        }

        resetForm();
        setModalVisible(false);
    };

    const resetForm = () => {
        setFormData({
            type: 'Expense',
            category: 'Food',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            paymentMethod: 'Cash'
        });
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount.toString(),
            date: transaction.date.split('T')[0],
            description: transaction.description || '',
            paymentMethod: transaction.paymentMethod || 'Cash'
        });
        setModalVisible(true);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '₹0';
        }
        return `₹${Number(amount).toLocaleString('en-IN')}`;
    };

    const handleAddBudget = async () => {
        if (!budgetFormData.monthlyLimit || parseFloat(budgetFormData.monthlyLimit) <= 0) return;

        await setBudget({
            ...budgetFormData,
            monthlyLimit: parseFloat(budgetFormData.monthlyLimit)
        });

        setBudgetFormData({
            category: 'Food',
            monthlyLimit: '',
            month: new Date().toISOString().substring(0, 7)
        });
        setBudgetModalVisible(false);
        fetchBudgets(currentMonth);
    };

    const getBudgetProgress = (category) => {
        const spent = transactions
            .filter(t => t.category === category && t.type === 'Expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        return spent;
    };

    const themeStyles = {
        container: {
            backgroundColor: theme.colors.background,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
        card: {
            backgroundColor: theme.colors.card,
        },
        modalContent: {
            backgroundColor: theme.colors.card,
        },
        input: {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.input,
        },
        chip: {
            backgroundColor: theme.colors.chip,
        },
        tabActive: {
            backgroundColor: theme.colors.primary,
        },
        tabInactive: {
            backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
        },
        tabTextInactive: {
            color: isDarkMode ? '#aaa' : '#666',
        }
    };

    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.transactionCard,
                themeStyles.card,
                { borderLeftColor: item.type === 'Income' ? theme.colors.success : theme.colors.danger }
            ]}
            onPress={() => handleEditTransaction(item)}
        >
            <View style={styles.transactionHeader}>
                <View style={styles.transactionLeft}>
                    <View style={[styles.iconPlaceholder, { backgroundColor: item.type === 'Income' ? theme.colors.success + '20' : theme.colors.danger + '20' }]}>
                        <Text style={{ fontSize: 18 }}>{item.type === 'Income' ? '💰' : '💸'}</Text>
                    </View>
                    <View>
                        <Text style={[styles.transactionCategory, themeStyles.text]}>{item.category || 'Uncategorized'}</Text>
                        <Text style={styles.transactionDate}>
                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[
                        styles.transactionAmount,
                        { color: item.type === 'Income' ? theme.colors.success : theme.colors.danger }
                    ]}>
                        {item.type === 'Income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <TouchableOpacity onPress={() => deleteTransaction(item._id)} style={styles.deleteButton}>
                        <Text style={[styles.deleteText, { color: theme.colors.subText }]}>×</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {item.description ? (
                <Text style={[styles.transactionDescription, themeStyles.subText]}>{item.description}</Text>
            ) : null}
        </TouchableOpacity>
    );

    const renderBudgetItem = ({ item }) => {
        const spent = getBudgetProgress(item.category);
        const percentage = (spent / (item.monthlyLimit || 1)) * 100;
        const remaining = (item.monthlyLimit || 0) - spent;

        let progressColor = theme.colors.success;
        if (percentage >= 90) progressColor = theme.colors.danger;
        else if (percentage >= 70) progressColor = theme.colors.warning;

        return (
            <View style={[styles.budgetCard, themeStyles.card]}>
                <View style={styles.budgetHeader}>
                    <View style={styles.budgetTitleRow}>
                        <Text style={[styles.budgetCategory, themeStyles.text]}>{item.category}</Text>
                        <TouchableOpacity onPress={() => deleteBudget(item._id)}>
                            <Text style={[styles.deleteText, { color: theme.colors.subText }]}>×</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.budgetLimit, themeStyles.subText]}>
                        Limit: {formatCurrency(item.monthlyLimit)}
                    </Text>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }]} />
                </View>

                <View style={styles.budgetFooter}>
                    <Text style={[styles.budgetSpent, { color: progressColor }]}>
                        {formatCurrency(spent)} spent
                    </Text>
                    <Text style={[styles.budgetRemaining, themeStyles.subText]}>
                        {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Monthly Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.summaryTitle}>This Month</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(monthlyStats?.totalIncome || 0)}
                        </Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Expense</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(monthlyStats?.totalExpense || 0)}
                        </Text>
                    </View>
                </View>
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceValue}>
                        {formatCurrency(monthlyStats?.balance || 0)}
                    </Text>
                </View>
            </View>

            {/* Tab Switcher */}
            <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0' }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transactions' ? themeStyles.tabActive : themeStyles.tabInactive]}
                    onPress={() => setActiveTab('transactions')}
                >
                    <Text style={[styles.tabText, activeTab === 'transactions' ? styles.activeTabText : themeStyles.tabTextInactive]}>
                        Transactions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'budgets' ? themeStyles.tabActive : themeStyles.tabInactive]}
                    onPress={() => setActiveTab('budgets')}
                >
                    <Text style={[styles.tabText, activeTab === 'budgets' ? styles.activeTabText : themeStyles.tabTextInactive]}>
                        Budgets
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content based on active tab */}
            {activeTab === 'transactions' ? (
                isLoading && transactions.length === 0 ? (
                    <View style={styles.listContent}>
                        <TransactionSkeleton />
                        <TransactionSkeleton />
                        <TransactionSkeleton />
                        <TransactionSkeleton />
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderTransactionItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={<AIFinanceCard />}
                        ListEmptyComponent={<Text style={[styles.emptyText, themeStyles.subText]}>No transactions yet</Text>}
                        extraData={isDarkMode}
                    />
                )
            ) : (
                isLoading && budgets.length === 0 ? (
                    <View style={styles.listContent}>
                        <TransactionSkeleton />
                        <TransactionSkeleton />
                        <TransactionSkeleton />
                    </View>
                ) : (
                    <FlatList
                        data={budgets}
                        renderItem={renderBudgetItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={[styles.emptyText, themeStyles.subText]}>No budgets set</Text>}
                        extraData={isDarkMode}
                    />
                )
            )}

            {/* Add Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                    if (activeTab === 'transactions') {
                        setEditingTransaction(null);
                        resetForm();
                        setModalVisible(true);
                    } else {
                        setBudgetModalVisible(true);
                    }
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add Transaction Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, themeStyles.modalContent]}>
                        <Text style={[styles.modalTitle, themeStyles.text]}>
                            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                        </Text>

                        {/* Type Selector */}
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeButton, themeStyles.chip, formData.type === 'Expense' && { backgroundColor: theme.colors.primary }]}
                                onPress={() => setFormData({ ...formData, type: 'Expense', category: 'Food' })}
                            >
                                <Text style={[styles.typeText, themeStyles.subText, formData.type === 'Expense' && styles.typeTextActive]}>
                                    Expense
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, themeStyles.chip, formData.type === 'Income' && { backgroundColor: theme.colors.primary }]}
                                onPress={() => setFormData({ ...formData, type: 'Income', category: 'Salary' })}
                            >
                                <Text style={[styles.typeText, themeStyles.subText, formData.type === 'Income' && styles.typeTextActive]}>
                                    Income
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Category Picker */}
                        <Text style={[styles.label, themeStyles.text]}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {CATEGORIES[formData.type].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, themeStyles.chip, formData.category === cat && { backgroundColor: theme.colors.primary }]}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                >
                                    <Text style={[styles.categoryText, themeStyles.subText, formData.category === cat && styles.categoryTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Amount Input */}
                        <Text style={[styles.label, themeStyles.text]}>Amount</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="0"
                            placeholderTextColor={theme.colors.subText}
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            keyboardType="numeric"
                        />

                        {/* Description */}
                        <Text style={[styles.label, themeStyles.text]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Add a note"
                            placeholderTextColor={theme.colors.subText}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setEditingTransaction(null);
                                    resetForm();
                                }}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveTransaction}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Budget Modal */}
            <Modal visible={budgetModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, themeStyles.modalContent]}>
                        <Text style={[styles.modalTitle, themeStyles.text]}>Set Budget</Text>

                        {/* Category Picker */}
                        <Text style={[styles.label, themeStyles.text]}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {CATEGORIES.Expense.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, themeStyles.chip, budgetFormData.category === cat && { backgroundColor: theme.colors.primary }]}
                                    onPress={() => setBudgetFormData({ ...budgetFormData, category: cat })}
                                >
                                    <Text style={[styles.categoryText, themeStyles.subText, budgetFormData.category === cat && styles.categoryTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Limit Input */}
                        <Text style={[styles.label, themeStyles.text]}>Monthly Limit</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="0"
                            placeholderTextColor={theme.colors.subText}
                            value={budgetFormData.monthlyLimit}
                            onChangeText={(text) => setBudgetFormData({ ...budgetFormData, monthlyLimit: text })}
                            keyboardType="numeric"
                        />

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
                                onPress={() => setBudgetModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddBudget}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    summaryCard: {
        padding: 24,
        margin: 16,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryItem: {
        flex: 1,
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 16,
    },
    summaryLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    balanceContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    balanceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    transactionCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    deleteButton: {
        padding: 4,
    },
    deleteText: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    transactionDescription: {
        fontSize: 13,
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        marginTop: -4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    typeButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#fff',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    categoryScroll: {
        marginBottom: 24,
    },
    categoryChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Tab Switcher Styles
    tabContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 16,
        marginBottom: 24,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    // Budget Card Styles
    budgetCard: {
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    budgetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    budgetCategory: {
        fontSize: 18,
        fontWeight: '700',
    },
    budgetLimit: {
        fontSize: 14,
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        borderRadius: 5,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    budgetSpent: {
        fontSize: 14,
        fontWeight: '600',
    },
    budgetRemaining: {
        fontSize: 14,
    },
});
