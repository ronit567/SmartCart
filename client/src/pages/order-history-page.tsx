import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { OrderWithItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function OrderHistoryPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  // Delete an order
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest('DELETE', `/api/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order deleted",
        description: "The order has been removed from your history",
      });
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear all order history
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/orders');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order history cleared",
        description: "All orders have been removed from your history",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear order history",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-1"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="text-gray-600 h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Order History</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center"
              size="sm"
              disabled={orders.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear order history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your order history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => clearHistoryMutation.mutate()}
                className="bg-red-500 hover:bg-red-600"
              >
                Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      
      <div className="flex-grow overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package className="h-12 w-12 mb-4" />
            <h2 className="text-xl font-medium mb-1">No orders yet</h2>
            <p className="text-gray-400 mb-4">Your order history will appear here</p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  className={`cursor-pointer hover:border-primary transition-colors ${selectedOrder?.id === order.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(order.createdAt), 'PPP, p')}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {order.items.map(item => item.product.name).join(', ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Order Details */}
            {selectedOrder && (
              <Card className="h-min">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{selectedOrder.id}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(selectedOrder.createdAt), 'PPP, p')}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (selectedOrder) {
                          deleteOrderMutation.mutate(selectedOrder.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3 mb-4">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="flex-1">
                            {item.product.name}{" "}
                            <span className="text-gray-500">x{item.quantity}</span>
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span>${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}