import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { bitcoinPurchaseSchema } from "../buy-bitcoin/buy-bitcoin.schema";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { bitcoinService } from "../../services/bitcoin.service";
import { queryClient } from "../../lib/query-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";

export const BitcoinPurchase = () => {
  const form = useForm({
    resolver: zodResolver(bitcoinPurchaseSchema),
    defaultValues: {
      amount: "",
    },
  });
  const { toast } = useToast();
  const [txId, setTxId] = useState(null);

  const { btcReceiveAddress, hasLinkedBank } = useCurrentUser();

  const { data: balanceData } = useQuery({
    queryKey: ["bitcoinBalance"],
    queryFn: bitcoinService.getBalance,
    enabled: !!btcReceiveAddress,
  });

  const { data: bankBalance } = useQuery({
    queryKey: ["bankBalance"],
    queryFn: bitcoinService.getBankBalance,
    enabled: !!hasLinkedBank,
  });

  const purchaseMutation = useMutation({
    mutationFn: values =>
      bitcoinService.purchaseBitcoin(parseFloat(values.amount)),
    onSuccess: data => {
      toast({
        title: "Purchase successful",
      });
      setTxId(data.txid);
      form.reset();
      queryClient.invalidateQueries(["bitcoinBalance"]);
      queryClient.invalidateQueries(["bankBalance"]);
    },
    onError: () => {
      toast({
        title: "Purchase failed",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values) {
    const purchaseAmount = parseFloat(values.amount);
    if (bankBalance && purchaseAmount > bankBalance.available) {
      return;
    }

    purchaseMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitcoin Purchase</CardTitle>
        <CardDescription>
          Purchase Bitcoin using your linked bank account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {btcReceiveAddress && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">
              Your Bitcoin Address
            </h4>
            <p className="font-mono text-sm break-all">{btcReceiveAddress}</p>
          </div>
        )}

        {balanceData?.balance !== undefined && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">
              Bitcoin Balance
            </h4>
            <p className="text-2xl font-bold">{balanceData.balance} BTC</p>
          </div>
        )}

        {bankBalance && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">
              Available Bank Balance
            </h4>
            <p className="text-2xl font-bold">
              ${bankBalance.available.toFixed(2)}
            </p>
          </div>
        )}

        {txId && (
          <div className="border-2 border-green-500 rounded pl-2 bg-green-50 p-3">
            <h4 className="text-sm font-medium text-green-700">
              Transaction ID
            </h4>
            <p className="font-mono text-sm break-all text-green-600">
              <a href="#" className="hover:text-green-800 transition-colors">
                {txId}
              </a>
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" min="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={purchaseMutation.isPending}>
              {purchaseMutation.isPending
                ? "Processing..."
                : "Purchase Bitcoin"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
